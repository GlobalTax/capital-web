import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrevoContact {
  id: number;
  email: string;
  emailBlacklisted: boolean;
  smsBlacklisted: boolean;
  createdAt: string;
  modifiedAt: string;
  listIds: number[];
  attributes: Record<string, unknown>;
}

interface BrevoListResponse {
  contacts: BrevoContact[];
  count: number;
}

interface BrevoList {
  id: number;
  name: string;
  totalBlacklisted: number;
  totalSubscribers: number;
  uniqueSubscribers: number;
  folderId: number;
}

interface BrevoListsResponse {
  lists: BrevoList[];
  count: number;
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';
    
    console.log(`📨 [brevo-list-contacts] Action: ${action}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lists from Brevo first to map list IDs to names
    async function getBrevoLists(): Promise<Map<number, string>> {
      const listsMap = new Map<number, string>();
      
      try {
        const response = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50&offset=0', {
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json() as BrevoListsResponse;
          for (const list of data.lists) {
            listsMap.set(list.id, list.name);
          }
          console.log(`📋 Loaded ${listsMap.size} Brevo lists`);
        }
      } catch (e) {
        console.error('Failed to load Brevo lists:', e);
      }
      
      return listsMap;
    }

    // ACTION: Get all Brevo lists
    if (action === 'lists') {
      const response = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50&offset=0&sort=desc', {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Brevo API error: ${error}`);
      }

      const data = await response.json() as BrevoListsResponse;
      
      return new Response(JSON.stringify({
        success: true,
        lists: data.lists,
        count: data.count,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: List contacts with pagination
    if (action === 'list') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000);
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const listId = url.searchParams.get('listId');
      const modifiedSince = url.searchParams.get('modifiedSince');
      
      let endpoint = `https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}&sort=desc`;
      
      if (modifiedSince) {
        endpoint += `&modifiedSince=${modifiedSince}`;
      }

      // If filtering by list, use different endpoint
      if (listId) {
        endpoint = `https://api.brevo.com/v3/contacts/lists/${listId}/contacts?limit=${limit}&offset=${offset}`;
      }

      console.log(`📥 Fetching contacts: ${endpoint}`);

      const response = await fetch(endpoint, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Brevo API error:', error);
        throw new Error(`Brevo API error: ${error}`);
      }

      const data = await response.json() as BrevoListResponse;
      
      // Get list names mapping
      const listsMap = await getBrevoLists();

      // Transform contacts with list names
      const contacts = data.contacts.map(contact => ({
        brevo_id: contact.id,
        email: contact.email,
        first_name: contact.attributes?.FIRSTNAME || contact.attributes?.PRENOM || '',
        last_name: contact.attributes?.LASTNAME || contact.attributes?.NOM || '',
        sms: contact.attributes?.SMS || '',
        company: contact.attributes?.COMPANY || contact.attributes?.SOCIETE || '',
        email_blacklisted: contact.emailBlacklisted,
        sms_blacklisted: contact.smsBlacklisted,
        brevo_created_at: contact.createdAt,
        brevo_modified_at: contact.modifiedAt,
        list_ids: contact.listIds,
        list_names: contact.listIds.map(id => listsMap.get(id) || `List ${id}`),
        attributes: contact.attributes,
      }));

      console.log(`✅ Fetched ${contacts.length} contacts (total: ${data.count})`);

      return new Response(JSON.stringify({
        success: true,
        contacts,
        count: data.count,
        limit,
        offset,
        hasMore: offset + limit < data.count,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Import contacts to database
    if (action === 'import') {
      const body = await req.json();
      const { contacts, batchId } = body;

      if (!contacts || !Array.isArray(contacts)) {
        throw new Error('contacts array is required');
      }

      console.log(`📥 Importing ${contacts.length} contacts to database`);

      // Prepare contacts for brevo_contacts table
      const brevoContactsToUpsert = contacts.map((contact: any) => ({
        brevo_id: contact.brevo_id,
        email: contact.email,
        first_name: contact.first_name || null,
        last_name: contact.last_name || null,
        sms: contact.sms || null,
        company: contact.company || null,
        attributes: contact.attributes || {},
        list_ids: contact.list_ids || [],
        list_names: contact.list_names || [],
        email_blacklisted: contact.email_blacklisted || false,
        sms_blacklisted: contact.sms_blacklisted || false,
        brevo_created_at: contact.brevo_created_at,
        brevo_modified_at: contact.brevo_modified_at,
        import_batch_id: batchId || null,
        imported_at: new Date().toISOString(),
      }));

      // Also prepare contacts for master 'contactos' table (UPSERT on email)
      const contactosToUpsert = contacts.map((contact: any) => ({
        email: contact.email,
        contact_name: contact.first_name || null,
        contact_lastname: contact.last_name || null,
        phone: contact.sms || null,
        company_name: contact.company || null,
        brevo_id: contact.brevo_id?.toString() || null,
        source: 'brevo_import',
        updated_at: new Date().toISOString(),
      }));

      // Upsert to brevo_contacts (for backward compatibility)
      const { data: brevoData, error: brevoError } = await supabase
        .from('brevo_contacts')
        .upsert(brevoContactsToUpsert, {
          onConflict: 'email',
          ignoreDuplicates: false,
        })
        .select('id, email');

      if (brevoError) {
        console.error('brevo_contacts error:', brevoError);
      }

      // CRITICAL: Upsert to master 'contactos' table
      let contactosImported = 0;
      for (const contacto of contactosToUpsert) {
        const { error: contactoError } = await supabase
          .from('contactos')
          .upsert(contacto, {
            onConflict: 'email',
            ignoreDuplicates: false,
          });
        
        if (!contactoError) {
          contactosImported++;
        } else {
          console.log(`⚠️ Error upserting to contactos: ${contactoError.message}`);
        }
      }

      console.log(`✅ Imported ${brevoData?.length || 0} to brevo_contacts, ${contactosImported} to contactos`);

      return new Response(JSON.stringify({
        success: true,
        imported: brevoData?.length || 0,
        contactos_synced: contactosImported,
        contacts: brevoData,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Get statistics
    if (action === 'stats') {
      // Get Brevo total count
      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts?limit=1&offset=0', {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      let brevoTotal = 0;
      if (brevoResponse.ok) {
        const data = await brevoResponse.json();
        brevoTotal = data.count;
      }

      // Get imported count from database
      const { count: importedCount, error } = await supabase
        .from('brevo_contacts')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Database error:', error);
      }

      // Get synced to CRM count
      const { count: syncedCount } = await supabase
        .from('brevo_contacts')
        .select('id', { count: 'exact', head: true })
        .eq('is_synced_to_crm', true);

      return new Response(JSON.stringify({
        success: true,
        stats: {
          brevoTotal,
          importedCount: importedCount || 0,
          syncedToCrm: syncedCount || 0,
          pendingImport: brevoTotal - (importedCount || 0),
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Search contact by email
    if (action === 'search') {
      const email = url.searchParams.get('email');
      
      if (!email) {
        throw new Error('email parameter is required');
      }

      const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return new Response(JSON.stringify({
          success: true,
          found: false,
          contact: null,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Brevo API error: ${error}`);
      }

      const contact = await response.json();
      
      return new Response(JSON.stringify({
        success: true,
        found: true,
        contact: {
          brevo_id: contact.id,
          email: contact.email,
          first_name: contact.attributes?.FIRSTNAME || '',
          last_name: contact.attributes?.LASTNAME || '',
          sms: contact.attributes?.SMS || '',
          company: contact.attributes?.COMPANY || '',
          email_blacklisted: contact.emailBlacklisted,
          sms_blacklisted: contact.smsBlacklisted,
          brevo_created_at: contact.createdAt,
          brevo_modified_at: contact.modifiedAt,
          list_ids: contact.listIds,
          attributes: contact.attributes,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
