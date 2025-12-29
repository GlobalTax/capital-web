import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Brevo Retry Failed - Edge Function
 * 
 * Reintenta sincronizaciones fallidas de Brevo:
 * - Busca registros con sync_status = 'failed' y sync_attempts < 3
 * - Reintenta la sincronización según el entity_type
 * - Actualiza el contador de intentos
 * 
 * Puede ejecutarse manualmente o mediante cron job
 */

interface FailedSync {
  id: string;
  entity_id: string;
  entity_type: string;
  sync_attempts: number;
  sync_error: string | null;
  attributes_sent: Record<string, any> | null;
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse optional parameters
    let maxRetries = 3;
    let limit = 50;
    let entityTypeFilter: string | null = null;

    try {
      const body = await req.json();
      maxRetries = body.maxRetries || 3;
      limit = body.limit || 50;
      entityTypeFilter = body.entityType || null;
    } catch {
      // No body or invalid JSON - use defaults
    }

    console.log(`🔄 [brevo-retry-failed] Starting retry process. Max retries: ${maxRetries}, Limit: ${limit}`);

    // Find failed syncs that haven't exceeded max attempts
    let query = supabase
      .from('brevo_sync_log')
      .select('*')
      .eq('sync_status', 'failed')
      .lt('sync_attempts', maxRetries)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (entityTypeFilter) {
      query = query.eq('entity_type', entityTypeFilter);
    }

    const { data: failedSyncs, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Failed to fetch failed syncs: ${queryError.message}`);
    }

    if (!failedSyncs || failedSyncs.length === 0) {
      console.log('✅ No failed syncs to retry');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No failed syncs to retry',
          processed: 0,
          duration_ms: Date.now() - startTime
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${failedSyncs.length} failed syncs to retry`);

    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const sync of failedSyncs as FailedSync[]) {
      const attemptNumber = (sync.sync_attempts || 0) + 1;
      console.log(`🔁 Retrying ${sync.entity_type}:${sync.entity_id} (attempt ${attemptNumber})`);

      try {
        let retrySuccess = false;
        let retryError: string | null = null;

        // Retry based on entity type
        switch (sync.entity_type) {
          case 'contact':
          case 'valuation':
          case 'collaborator':
          case 'acquisition': {
            // Determine table based on entity type or stored attributes
            const tableMap: Record<string, string> = {
              'contact': 'contact_leads',
              'valuation': 'company_valuations',
              'collaborator': 'collaborator_applications',
              'acquisition': 'acquisition_leads',
            };
            
            const tableName = tableMap[sync.entity_type] || 'company_valuations';
            
            // Fetch the original record
            const { data: record, error: fetchError } = await supabase
              .from(tableName)
              .select('*')
              .eq('id', sync.entity_id)
              .maybeSingle();

            if (fetchError || !record) {
              retryError = `Record not found in ${tableName}`;
              break;
            }

            // Call sync-to-brevo
            const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-to-brevo', {
              body: {
                record,
                table: tableName,
                type: 'RETRY'
              }
            });

            if (syncError) {
              retryError = syncError.message;
            } else {
              retrySuccess = true;
            }
            break;
          }

          case 'event': {
            // Events cannot be reliably retried without original data
            retryError = 'Event retries not supported - original event data not preserved';
            break;
          }

          case 'company': {
            // Fetch empresa and retry
            const { data: empresa, error: fetchError } = await supabase
              .from('empresas')
              .select('*')
              .eq('id', sync.entity_id)
              .maybeSingle();

            if (fetchError || !empresa) {
              retryError = 'Company not found in empresas table';
              break;
            }

            const { error: syncError } = await supabase.functions.invoke('sync-company-to-brevo', {
              body: {
                record: empresa,
                type: 'RETRY'
              }
            });

            if (syncError) {
              retryError = syncError.message;
            } else {
              retrySuccess = true;
            }
            break;
          }

          case 'deal': {
            // Fetch mandato and retry
            const { data: mandato, error: fetchError } = await supabase
              .from('mandatos')
              .select('*')
              .eq('id', sync.entity_id)
              .maybeSingle();

            if (fetchError || !mandato) {
              retryError = 'Deal not found in mandatos table';
              break;
            }

            const { error: syncError } = await supabase.functions.invoke('sync-deal-to-brevo', {
              body: {
                record: mandato,
                type: 'RETRY'
              }
            });

            if (syncError) {
              retryError = syncError.message;
            } else {
              retrySuccess = true;
            }
            break;
          }

          default:
            retryError = `Unknown entity type: ${sync.entity_type}`;
        }

        // Update sync log with result
        const updateData: Record<string, any> = {
          sync_attempts: attemptNumber,
          last_sync_at: new Date().toISOString(),
        };

        if (retrySuccess) {
          updateData.sync_status = 'success';
          updateData.sync_error = null;
          console.log(`✅ Retry successful for ${sync.entity_id}`);
        } else {
          updateData.sync_error = retryError;
          // Mark as permanently failed if max attempts reached
          if (attemptNumber >= maxRetries) {
            updateData.sync_status = 'permanently_failed';
            console.log(`❌ Max retries reached for ${sync.entity_id}: ${retryError}`);
          } else {
            console.log(`⚠️ Retry failed for ${sync.entity_id}: ${retryError}`);
          }
        }

        await supabase
          .from('brevo_sync_log')
          .update(updateData)
          .eq('id', sync.id);

        results.push({
          id: sync.id,
          success: retrySuccess,
          error: retryError || undefined,
        });

      } catch (retryErr: any) {
        console.error(`❌ Exception retrying ${sync.entity_id}:`, retryErr);
        
        // Update attempt count even on exception
        await supabase
          .from('brevo_sync_log')
          .update({
            sync_attempts: (sync.sync_attempts || 0) + 1,
            sync_error: retryErr.message,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', sync.id);

        results.push({
          id: sync.id,
          success: false,
          error: retryErr.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const durationMs = Date.now() - startTime;

    console.log(`📊 Retry complete: ${successCount} success, ${failCount} failed, ${durationMs}ms`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        successful: successCount,
        failed: failCount,
        duration_ms: durationMs,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in brevo-retry-failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        duration_ms: Date.now() - startTime
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
