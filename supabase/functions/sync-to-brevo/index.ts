import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrevoContact {
  email: string;
  attributes: {
    LEAD_SOURCE: string;
    LEAD_ID: string;
    COMPANY?: string;
    CONTACT_NAME?: string;
    PHONE?: string;
    INDUSTRY?: string;
    REVENUE?: number;
    EBITDA?: number;
    EMPLOYEE_RANGE?: string;
    UTM_SOURCE?: string;
    UTM_MEDIUM?: string;
    UTM_CAMPAIGN?: string;
    UTM_TERM?: string;
    UTM_CONTENT?: string;
    LEAD_STATUS: string;
    CREATED_AT: string;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { record, table, type } = await req.json();
    
    console.log(`📨 [sync-to-brevo] Processing ${type} for ${table}:`, record.id);

    // Determinar source y mapear datos
    let contact: BrevoContact;
    let leadType: string;

    if (table === 'company_valuations') {
      leadType = 'valuation';
      contact = {
        email: record.email,
        attributes: {
          LEAD_SOURCE: 'calculator',
          LEAD_ID: record.id,
          COMPANY: record.company_name,
          CONTACT_NAME: record.contact_name,
          PHONE: record.phone || '',
          INDUSTRY: record.industry || '',
          REVENUE: record.revenue || 0,
          EBITDA: record.ebitda || 0,
          EMPLOYEE_RANGE: record.employee_range || '',
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          UTM_TERM: record.utm_term || '',
          UTM_CONTENT: record.utm_content || '',
          LEAD_STATUS: record.valuation_status || 'new',
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'contact_leads') {
      leadType = 'contact';
      contact = {
        email: record.email,
        attributes: {
          LEAD_SOURCE: 'contact_form',
          LEAD_ID: record.id,
          COMPANY: record.company,
          CONTACT_NAME: record.full_name,
          PHONE: record.phone || '',
          INDUSTRY: record.sectors_of_interest || '',
          EMPLOYEE_RANGE: record.company_size || '',
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          UTM_TERM: record.utm_term || '',
          UTM_CONTENT: record.utm_content || '',
          LEAD_STATUS: record.status || 'new',
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else {
      throw new Error(`Unknown table: ${table}`);
    }

    // Añadir a lista específica si está configurada
    const listIdEnvVar = leadType === 'valuation' 
      ? 'BREVO_LIST_ID_VALUATIONS' 
      : 'BREVO_LIST_ID_CONTACTS';
    
    const listId = Deno.env.get(listIdEnvVar);
    if (listId) {
      contact.listIds = [parseInt(listId)];
    }

    // Enviar a Brevo API
    console.log('📤 Sending to Brevo:', contact.email);
    
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    const brevoData = await brevoResponse.json();

    // Registrar resultado en message_logs
    const logEntry = {
      type: 'brevo',
      status: brevoResponse.ok ? 'sent' : 'failed',
      recipient: contact.email,
      provider_name: 'brevo',
      valuation_id: leadType === 'valuation' ? record.id : null,
      contact_lead_id: leadType === 'contact' ? record.id : null,
      error_details: brevoResponse.ok ? null : JSON.stringify(brevoData),
      metadata: {
        brevo_response: brevoData,
        lead_source: contact.attributes.LEAD_SOURCE,
        list_ids: contact.listIds,
      }
    };

    await supabase.from('message_logs').insert(logEntry);

    if (!brevoResponse.ok) {
      console.error('❌ Brevo API error:', brevoData);
      
      // Si el contacto ya existe (código 400 con "duplicate"), actualizar
      if (brevoResponse.status === 400 && brevoData.code === 'duplicate_parameter') {
        console.log('🔄 Contact exists, updating...');
        
        const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(contact.email)}`, {
          method: 'PUT',
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attributes: contact.attributes,
            listIds: contact.listIds,
          }),
        });

        if (updateResponse.ok) {
          console.log('✅ Contact updated successfully');
          return new Response(
            JSON.stringify({ success: true, action: 'updated', brevo: await updateResponse.json() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      throw new Error(`Brevo API error: ${JSON.stringify(brevoData)}`);
    }

    console.log('✅ Successfully synced to Brevo');

    return new Response(
      JSON.stringify({ success: true, action: 'created', brevo: brevoData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in sync-to-brevo:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
