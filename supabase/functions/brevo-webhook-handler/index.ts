import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Brevo Webhook Handler - Edge Function
 * 
 * Recibe eventos de Brevo y actualiza la base de datos local:
 * - delivered: Email entregado
 * - opened: Email abierto (puede ser múltiple)
 * - click: Click en enlace del email
 * - hard_bounce: Rebote permanente (email inválido)
 * - soft_bounce: Rebote temporal
 * - unsubscribed: Usuario se dio de baja
 * - spam: Reportado como spam
 * - blocked: Email bloqueado
 * - invalid: Email inválido
 * 
 * Webhook URL: https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/brevo-webhook-handler
 */

interface BrevoWebhookEvent {
  event: string;
  email: string;
  id?: number;
  date?: string;
  ts?: number;
  ts_event?: number;
  "message-id"?: string;
  subject?: string;
  tag?: string;
  sending_ip?: string;
  link?: string;
  reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Brevo puede enviar un array de eventos o un evento individual
    const body = await req.json();
    const events: BrevoWebhookEvent[] = Array.isArray(body) ? body : [body];

    console.log(`📥 [brevo-webhook-handler] Received ${events.length} event(s)`);

    const results: Array<{ email: string; event: string; success: boolean; error?: string }> = [];

    for (const webhookEvent of events) {
      const { event, email, link, reason } = webhookEvent;
      const eventDate = webhookEvent.date || new Date().toISOString();

      console.log(`📊 Processing event: ${event} for ${email}`);

      try {
        // Buscar el contacto en todas las tablas de leads
        const tables = [
          { name: 'company_valuations', emailField: 'email' },
          { name: 'contact_leads', emailField: 'email' },
          { name: 'collaborator_applications', emailField: 'email' },
          { name: 'acquisition_leads', emailField: 'email' },
          { name: 'company_acquisition_inquiries', emailField: 'email' },
        ];

        let updated = false;

        for (const table of tables) {
          // Buscar registros con este email
          const { data: records, error: selectError } = await supabase
            .from(table.name)
            .select('id')
            .eq(table.emailField, email)
            .limit(10);

          if (selectError || !records || records.length === 0) {
            continue;
          }

          // Preparar update según el tipo de evento
          let updateData: Record<string, any> = {};

          switch (event) {
            case 'delivered':
              updateData = {
                email_delivered: true,
                email_delivered_at: eventDate,
              };
              break;

            case 'opened':
            case 'unique_opened':
              // Incrementar contador y actualizar fecha
              // Usamos una consulta SQL raw para incrementar
              for (const record of records) {
                const { error: updateError } = await supabase.rpc('increment_email_opens', {
                  p_table_name: table.name,
                  p_record_id: record.id,
                  p_opened_at: eventDate,
                });
                
                if (updateError) {
                  console.log(`⚠️ Could not increment opens via RPC for ${table.name}:${record.id}, using direct update`);
                  // Fallback: update directo sin incrementar
                  await supabase
                    .from(table.name)
                    .update({
                      email_opened: true,
                      email_opened_at: eventDate,
                    })
                    .eq('id', record.id);
                }
              }
              updated = true;
              continue; // Skip the generic update below

            case 'click':
              // Incrementar clicks y guardar última URL
              updateData = {
                email_clicked: true,
                last_email_click_at: eventDate,
                last_clicked_url: link || null,
              };
              break;

            case 'hard_bounce':
              updateData = {
                email_bounced: true,
                email_bounce_type: 'hard',
                email_bounce_reason: reason || 'Invalid email address',
                email_valid: false,
              };
              break;

            case 'soft_bounce':
              updateData = {
                email_soft_bounced: true,
                email_bounce_type: 'soft',
                email_bounce_reason: reason || 'Temporary delivery failure',
              };
              break;

            case 'unsubscribed':
              updateData = {
                email_unsubscribed: true,
                email_unsubscribed_at: eventDate,
              };
              break;

            case 'spam':
            case 'complaint':
              updateData = {
                email_spam_reported: true,
                email_spam_reported_at: eventDate,
              };
              break;

            case 'blocked':
            case 'invalid':
              updateData = {
                email_blocked: true,
                email_valid: false,
                email_block_reason: reason || event,
              };
              break;

            default:
              console.log(`⚠️ Unknown event type: ${event}`);
              continue;
          }

          // Aplicar update si hay datos
          if (Object.keys(updateData).length > 0) {
            for (const record of records) {
              const { error: updateError } = await supabase
                .from(table.name)
                .update(updateData)
                .eq('id', record.id);

              if (updateError) {
                console.log(`⚠️ Error updating ${table.name}:${record.id}:`, updateError.message);
              } else {
                console.log(`✅ Updated ${table.name}:${record.id} with ${event} event`);
                updated = true;
              }
            }
          }
        }

        // Log del evento recibido
        await supabase.from('brevo_sync_log').insert({
          entity_id: email,
          entity_type: 'webhook_event',
          sync_status: updated ? 'success' : 'no_match',
          sync_error: updated ? null : 'No matching records found',
          last_sync_at: new Date().toISOString(),
        });

        results.push({
          email,
          event,
          success: updated,
          error: updated ? undefined : 'No matching records found',
        });

      } catch (eventError: any) {
        console.error(`❌ Error processing event for ${email}:`, eventError);
        results.push({
          email,
          event,
          success: false,
          error: eventError.message,
        });
      }
    }

    console.log(`📊 Processed ${results.length} events, ${results.filter(r => r.success).length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in brevo-webhook-handler:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
