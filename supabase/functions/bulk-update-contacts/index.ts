import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkUpdateRequest {
  contact_ids: string[]; // Format: "origin_uuid" e.g. "contact_abc123"
  updates: {
    acquisition_channel_id?: string;
    lead_form?: string;
    lead_received_at?: string; // ISO date string for bulk date updates
    lead_status_crm?: string; // Status key from contact_statuses
  };
}

interface BulkUpdateResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  failed_ids: string[];
  errors: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: BulkUpdateRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { contact_ids, updates } = body;

    console.log(`[bulk-update-contacts] Processing ${contact_ids.length} contacts`);
    console.log(`[bulk-update-contacts] Updates:`, updates);

    // Validate request
    if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'contact_ids is required and must be a non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'updates object is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate acquisition_channel_id if provided
    if (updates.acquisition_channel_id) {
      const { data: channel, error: channelError } = await supabase
        .from('acquisition_channels')
        .select('id, name')
        .eq('id', updates.acquisition_channel_id)
        .eq('is_active', true)
        .single();

      if (channelError || !channel) {
        console.error('[bulk-update-contacts] Invalid channel:', channelError);
        return new Response(
          JSON.stringify({ error: 'Invalid acquisition_channel_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[bulk-update-contacts] Valid channel: ${channel.name}`);
    }

    // Validate lead_form if provided
    if (updates.lead_form) {
      const { data: form, error: formError } = await supabase
        .from('lead_forms')
        .select('id, name')
        .eq('id', updates.lead_form)
        .eq('is_active', true)
        .single();

      if (formError || !form) {
        console.error('[bulk-update-contacts] Invalid lead_form:', formError);
        return new Response(
          JSON.stringify({ error: 'Invalid lead_form' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[bulk-update-contacts] Valid lead form: ${form.name}`);
    }

    // Validate lead_received_at if provided (must not be in the future)
    if (updates.lead_received_at) {
      const receivedDate = new Date(updates.lead_received_at);
      if (isNaN(receivedDate.getTime())) {
        return new Response(
          JSON.stringify({ error: 'Invalid lead_received_at date format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (receivedDate > new Date()) {
        return new Response(
          JSON.stringify({ error: 'lead_received_at cannot be in the future' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[bulk-update-contacts] Valid lead_received_at: ${updates.lead_received_at}`);
    }

    // Validate lead_status_crm if provided
    if (updates.lead_status_crm) {
      const { data: status, error: statusError } = await supabase
        .from('contact_statuses')
        .select('id, status_key, label')
        .eq('status_key', updates.lead_status_crm)
        .eq('is_active', true)
        .single();

      if (statusError || !status) {
        console.error('[bulk-update-contacts] Invalid lead_status_crm:', statusError);
        return new Response(
          JSON.stringify({ error: `Invalid lead_status_crm: ${updates.lead_status_crm}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[bulk-update-contacts] Valid status: ${status.label} (${status.status_key})`);
    }

    // Group contacts by origin table
    const contactsByTable: Record<string, string[]> = {
      contact_leads: [],
      company_valuations: [],
      general_contact_leads: [],
      collaborator_applications: [],
      acquisition_leads: [],
      company_acquisition_inquiries: [],
      advisor_valuations: [],
      buyer_contacts: [],
    };

    // Map origin prefixes to table names
    const originToTable: Record<string, string> = {
      'contact': 'contact_leads',
      'valuation': 'company_valuations',
      'general': 'general_contact_leads',
      'collaborator': 'collaborator_applications',
      'acquisition': 'acquisition_leads',
      'company_acquisition': 'company_acquisition_inquiries',
      'advisor': 'advisor_valuations',
      'buyer': 'buyer_contacts',
    };

    // Parse contact IDs and group by table
    for (const contactId of contact_ids) {
      // Find the origin prefix
      let foundOrigin = false;
      for (const [origin, table] of Object.entries(originToTable)) {
        if (contactId.startsWith(`${origin}_`)) {
          const uuid = contactId.substring(origin.length + 1);
          contactsByTable[table].push(uuid);
          foundOrigin = true;
          break;
        }
      }
      
      if (!foundOrigin) {
        console.warn(`[bulk-update-contacts] Unknown origin for contact: ${contactId}`);
      }
    }

    console.log('[bulk-update-contacts] Grouped by table:', 
      Object.entries(contactsByTable)
        .filter(([_, ids]) => ids.length > 0)
        .map(([table, ids]) => `${table}: ${ids.length}`)
    );

    const result: BulkUpdateResponse = {
      success: true,
      updated_count: 0,
      failed_count: 0,
      failed_ids: [],
      errors: [],
    };

    // Tables that support acquisition_channel_id
    const tablesWithChannel = [
      'contact_leads',
      'general_contact_leads',
      'company_valuations',
      'collaborator_applications',
      'acquisition_leads',
      'company_acquisition_inquiries',
      'advisor_valuations',
      // buyer_contacts does NOT have acquisition_channel_id
    ];

    // Tables that have updated_at column
    const tablesWithUpdatedAt = [
      'contact_leads',
      'general_contact_leads',
      'collaborator_applications',
      'acquisition_leads',
      'company_acquisition_inquiries',
      'advisor_valuations',
      'buyer_contacts',
      // 'company_valuations' does NOT have updated_at
    ];

    // Tables that support lead_status_crm
    const tablesWithStatusCrm = [
      'contact_leads',
      'company_valuations',
      'general_contact_leads',
      'collaborator_applications',
      'acquisition_leads',
      'company_acquisition_inquiries',
      'advisor_valuations',
    ];

    // Process each table
    for (const [table, ids] of Object.entries(contactsByTable)) {
      if (ids.length === 0) continue;

      // Only update acquisition_channel_id on supported tables
      if (updates.acquisition_channel_id && !tablesWithChannel.includes(table)) {
        console.log(`[bulk-update-contacts] Skipping ${table} - doesn't support acquisition_channel_id`);
        // Mark these as failed with explanation
        for (const id of ids) {
          const origin = Object.entries(originToTable).find(([_, t]) => t === table)?.[0];
          result.failed_ids.push(`${origin}_${id}`);
        }
        result.failed_count += ids.length;
        result.errors.push(`La tabla ${table} no soporta canal de adquisición`);
        continue;
      }

      // Only update lead_status_crm on supported tables
      if (updates.lead_status_crm && !tablesWithStatusCrm.includes(table)) {
        console.log(`[bulk-update-contacts] Skipping ${table} - doesn't support lead_status_crm`);
        for (const id of ids) {
          const origin = Object.entries(originToTable).find(([_, t]) => t === table)?.[0];
          result.failed_ids.push(`${origin}_${id}`);
        }
        result.failed_count += ids.length;
        result.errors.push(`La tabla ${table} no soporta estado CRM`);
        continue;
      }

      try {
        // Build update payload - only include fields the table supports
        const updatePayload: Record<string, unknown> = {};
        
        if (updates.acquisition_channel_id !== undefined && tablesWithChannel.includes(table)) {
          updatePayload.acquisition_channel_id = updates.acquisition_channel_id;
        }
        if (updates.lead_form !== undefined) {
          updatePayload.lead_form = updates.lead_form;
        }
        if (updates.lead_received_at !== undefined) {
          updatePayload.lead_received_at = updates.lead_received_at;
        }
        if (updates.lead_status_crm !== undefined && tablesWithStatusCrm.includes(table)) {
          updatePayload.lead_status_crm = updates.lead_status_crm;
        }
        
        if (tablesWithUpdatedAt.includes(table)) {
          updatePayload.updated_at = new Date().toISOString();
        }

        // Skip if no applicable updates
        if (Object.keys(updatePayload).filter(k => k !== 'updated_at').length === 0) {
          console.log(`[bulk-update-contacts] No applicable updates for ${table}, skipping`);
          continue;
        }

        // Determine lead_type for activity logging
        const leadTypeMap: Record<string, string> = {
          'contact_leads': 'contact',
          'company_valuations': 'valuation',
          'general_contact_leads': 'general',
          'collaborator_applications': 'collaborator',
          'acquisition_leads': 'acquisition',
          'company_acquisition_inquiries': 'company_acquisition',
          'advisor_valuations': 'advisor',
          'buyer_contacts': 'buyer',
        };
        const leadType = leadTypeMap[table] || 'unknown';

        const { data, error } = await supabase
          .from(table)
          .update(updatePayload)
          .in('id', ids)
          .select('id');

        if (error) {
          console.error(`[bulk-update-contacts] Error updating ${table}:`, error);
          const origin = Object.entries(originToTable).find(([_, t]) => t === table)?.[0];
          for (const id of ids) {
            result.failed_ids.push(`${origin}_${id}`);
          }
          result.failed_count += ids.length;
          result.errors.push(`Error en ${table}: ${error.message}`);
        } else {
          console.log(`[bulk-update-contacts] Updated ${data?.length || 0} records in ${table}`);
          result.updated_count += data?.length || 0;

          // Log status change activities for bulk updates (since triggers don't fire with service_role)
          if (updates.lead_status_crm && data && data.length > 0 && tablesWithStatusCrm.includes(table)) {
            const activityInserts = data.map((record: { id: string }) => ({
              lead_id: record.id,
              lead_type: leadType,
              activity_type: 'status_changed',
              description: `Estado cambiado a ${updates.lead_status_crm} (masivo)`,
              metadata: {
                to_status: updates.lead_status_crm,
                change_source: 'bulk',
                bulk_count: contact_ids.length,
                table_name: table
              },
              created_by: null // service_role doesn't have auth.uid()
            }));

            const { error: activityError } = await supabase
              .from('lead_activities')
              .insert(activityInserts);

            if (activityError) {
              console.error(`[bulk-update-contacts] Error logging activities for ${table}:`, activityError);
              // Don't fail the whole operation, just log the error
            } else {
              console.log(`[bulk-update-contacts] Logged ${activityInserts.length} status change activities for ${table}`);
            }
          }
        }
      } catch (err) {
        console.error(`[bulk-update-contacts] Exception updating ${table}:`, err);
        const origin = Object.entries(originToTable).find(([_, t]) => t === table)?.[0];
        for (const id of ids) {
          result.failed_ids.push(`${origin}_${id}`);
        }
        result.failed_count += ids.length;
        result.errors.push(`Excepción en ${table}: ${String(err)}`);
      }
    }

    result.success = result.failed_count === 0;

    console.log('[bulk-update-contacts] Final result:', result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[bulk-update-contacts] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
