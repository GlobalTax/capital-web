import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email validation regex
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Helper function to safely parse JSON responses
async function safeJsonParse(response: Response): Promise<any> {
  const text = await response.text();
  if (!text || text.trim() === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    console.log(`⚠️ Could not parse response as JSON: ${text.substring(0, 200)}`);
    return { raw: text };
  }
}

// Helper: Format phone for Brevo SMS attribute
function formatPhoneForBrevo(phone: string | null): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  if (cleaned.length === 9 && /^[6789]/.test(cleaned)) {
    cleaned = '34' + cleaned;
  }
  return cleaned;
}

// Sleep helper for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Chunk array into batches
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

interface SyncResult {
  processed: number;
  created: number;
  found: number;
  failed: number;
  skipped: number;
  details: Array<{
    id: string;
    email: string;
    status: 'created' | 'found' | 'failed' | 'skipped';
    brevo_id?: number;
    error?: string;
  }>;
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const {
      dryRun = false,
      limit = 500,
      source = null,
      listIds = [3] // Default Brevo list for synced contacts
    } = body;

    console.log(`🚀 brevo-sync-pending: Starting sync (dryRun=${dryRun}, limit=${limit}, source=${source})`);

    // 1. Fetch pending contacts (without brevo_id)
    let query = supabase
      .from('contactos')
      .select('id, email, nombre, apellidos, telefono, cargo, source, empresa_principal_id')
      .is('brevo_id', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (source) {
      query = query.eq('source', source);
    }

    const { data: pendingContacts, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Error fetching pending contacts: ${fetchError.message}`);
    }

    console.log(`📊 Found ${pendingContacts?.length || 0} pending contacts`);

    if (!pendingContacts || pendingContacts.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending contacts to sync',
        result: { processed: 0, created: 0, found: 0, failed: 0, skipped: 0, details: [] }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Filter valid emails
    const validContacts = pendingContacts.filter(c => EMAIL_REGEX.test(c.email));
    const invalidEmails = pendingContacts.filter(c => !EMAIL_REGEX.test(c.email));

    console.log(`✅ Valid emails: ${validContacts.length}`);
    console.log(`❌ Invalid emails: ${invalidEmails.length}`);

    if (invalidEmails.length > 0) {
      console.log(`⚠️ Invalid emails:`, invalidEmails.map(c => ({ id: c.id, email: c.email })));
    }

    const result: SyncResult = {
      processed: 0,
      created: 0,
      found: 0,
      failed: 0,
      skipped: invalidEmails.length,
      details: invalidEmails.map(c => ({
        id: c.id,
        email: c.email,
        status: 'skipped' as const,
        error: 'Invalid email format'
      }))
    };

    if (dryRun) {
      console.log(`🔍 DRY RUN MODE - No changes will be made`);
      
      // In dry run, just return what would be processed
      return new Response(JSON.stringify({
        success: true,
        dryRun: true,
        message: `Would process ${validContacts.length} contacts`,
        preview: {
          valid: validContacts.length,
          invalid: invalidEmails.length,
          contacts: validContacts.slice(0, 20).map(c => ({
            id: c.id,
            email: c.email,
            nombre: c.nombre,
            apellidos: c.apellidos,
            source: c.source
          }))
        },
        invalidEmails: invalidEmails.map(c => ({ id: c.id, email: c.email }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Process in batches of 50
    const batches = chunk(validContacts, 50);
    console.log(`📦 Processing ${batches.length} batches of up to 50 contacts`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`\n🔄 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} contacts)`);

      for (const contact of batch) {
        result.processed++;

        try {
          // 3a. Search for existing contact in Brevo
          const searchUrl = `https://api.brevo.com/v3/contacts/${encodeURIComponent(contact.email)}`;
          const searchResponse = await fetch(searchUrl, {
            method: 'GET',
            headers: {
              'api-key': BREVO_API_KEY,
              'Accept': 'application/json'
            }
          });

          let brevoId: number | null = null;

          if (searchResponse.ok) {
            // Contact exists in Brevo
            const brevoContact = await safeJsonParse(searchResponse);
            brevoId = brevoContact?.id;
            console.log(`✅ Found in Brevo: ${contact.email} (ID: ${brevoId})`);
            
            result.found++;
            result.details.push({
              id: contact.id,
              email: contact.email,
              status: 'found',
              brevo_id: brevoId!
            });
          } else if (searchResponse.status === 404) {
            // Contact doesn't exist - create it
            console.log(`➕ Creating in Brevo: ${contact.email}`);

            const createPayload = {
              email: contact.email,
              attributes: {
                FIRSTNAME: contact.nombre || '',
                LASTNAME: contact.apellidos || '',
                SMS: formatPhoneForBrevo(contact.telefono),
                JOB_TITLE: contact.cargo || '',
                LEAD_SOURCE: contact.source || 'sync_pending'
              },
              listIds: listIds,
              updateEnabled: true
            };

            const createResponse = await fetch('https://api.brevo.com/v3/contacts', {
              method: 'POST',
              headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(createPayload)
            });

            if (createResponse.ok || createResponse.status === 201) {
              const createResult = await safeJsonParse(createResponse);
              brevoId = createResult?.id;
              console.log(`✅ Created in Brevo: ${contact.email} (ID: ${brevoId})`);
              
              result.created++;
              result.details.push({
                id: contact.id,
                email: contact.email,
                status: 'created',
                brevo_id: brevoId!
              });
            } else {
              const errorBody = await safeJsonParse(createResponse);
              throw new Error(`Brevo create failed: ${createResponse.status} - ${JSON.stringify(errorBody)}`);
            }
          } else {
            const errorBody = await safeJsonParse(searchResponse);
            throw new Error(`Brevo search failed: ${searchResponse.status} - ${JSON.stringify(errorBody)}`);
          }

          // 3b. Update local contact with brevo_id
          if (brevoId) {
            const { error: updateError } = await supabase
              .from('contactos')
              .update({
                brevo_id: brevoId.toString(),
                brevo_synced_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', contact.id);

            if (updateError) {
              console.error(`⚠️ Failed to update local contact ${contact.id}: ${updateError.message}`);
            }
          }

          // Rate limiting: 100ms between requests
          await sleep(100);

        } catch (error) {
          console.error(`❌ Error processing ${contact.email}: ${error.message}`);
          result.failed++;
          result.details.push({
            id: contact.id,
            email: contact.email,
            status: 'failed',
            error: error.message
          });

          // Log to brevo_sync_log
          await supabase.from('brevo_sync_log').insert({
            entity_type: 'contacto',
            entity_id: contact.id,
            sync_type: 'sync_pending',
            sync_status: 'error',
            sync_error: error.message
          });
        }
      }

      // Log batch progress
      console.log(`📊 Batch ${batchIndex + 1} complete: Created=${result.created}, Found=${result.found}, Failed=${result.failed}`);
    }

    // 4. Final summary
    console.log(`\n✅ Sync complete!`);
    console.log(`📊 Results: Processed=${result.processed}, Created=${result.created}, Found=${result.found}, Failed=${result.failed}, Skipped=${result.skipped}`);

    // Log successful sync to brevo_sync_log
    await supabase.from('brevo_sync_log').insert({
      entity_type: 'batch_sync',
      entity_id: 'sync_pending_' + new Date().toISOString(),
      sync_type: 'sync_pending',
      sync_status: 'success',
      response_data: {
        processed: result.processed,
        created: result.created,
        found: result.found,
        failed: result.failed,
        skipped: result.skipped
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${result.created + result.found} contacts to Brevo`,
      result: {
        processed: result.processed,
        created: result.created,
        found: result.found,
        failed: result.failed,
        skipped: result.skipped,
        details: result.details.slice(0, 100) // Limit details in response
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ brevo-sync-pending error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
