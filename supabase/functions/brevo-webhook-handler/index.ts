import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Brevo Webhook Handler - Edge Function (Enhanced)
 * 
 * Recibe eventos de Brevo y actualiza la base de datos local:
 * 
 * EVENTOS DE EMAIL:
 * - delivered: Email entregado
 * - opened: Email abierto (puede ser múltiple)
 * - click: Click en enlace del email
 * - hard_bounce: Rebote permanente (email inválido)
 * - soft_bounce: Rebote temporal
 * - unsubscribed: Usuario se dio de baja
 * - spam: Reportado como spam
 * - blocked: Email bloqueado
 * - proxy_open: Apertura via proxy (Apple Mail Privacy)
 * 
 * EVENTOS DE CONTACTO (Sincronización Bidireccional):
 * - contact_updated: Atributos del contacto actualizados en Brevo
 * - contact_deleted: Contacto eliminado en Brevo
 * - list_addition: Contacto añadido a una lista
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
  // Marketing campaign fields
  camp_id?: number;
  "campaign name"?: string;
  // Contact update fields
  content?: Array<{ [key: string]: any }>;
  // List fields
  list_id?: number[];
  // Internal key
  key?: string;
}

// Mapeo de atributos de Brevo a campos de Capittal
const BREVO_ATTRIBUTE_MAP: Record<string, string> = {
  'FIRSTNAME': 'nombre',
  'LASTNAME': 'apellidos',
  'SMS': 'telefono',
  'PHONE': 'telefono',
  'JOB_TITLE': 'cargo',
  'NOMBRE': 'nombre',
  'APELLIDOS': 'apellidos',
  'TELEFONO': 'telefono',
};

// ============= WEBHOOK SIGNATURE VERIFICATION =============

async function verifyWebhookSignature(
  body: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison
  if (expectedHex.length !== signatureHeader.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    mismatch |= expectedHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

serve(async (req) => {
  const startTime = Date.now();

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

    // ============= VERIFY WEBHOOK SIGNATURE =============
    const webhookSecret = Deno.env.get('BREVO_WEBHOOK_SECRET');
    const rawBody = await req.text();

    if (webhookSecret) {
      const signature = req.headers.get('x-brevo-signature') || req.headers.get('x-sib-signature');
      const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);

      if (!isValid) {
        console.warn('⚠️ [brevo-webhook-handler] Invalid webhook signature - rejecting request');
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('⚠️ [brevo-webhook-handler] BREVO_WEBHOOK_SECRET not set - signature verification skipped');
    }

    // Brevo puede enviar un array de eventos o un evento individual
    const body = JSON.parse(rawBody);
    const events: BrevoWebhookEvent[] = Array.isArray(body) ? body : [body];

    console.log(`📥 [brevo-webhook-handler] Received ${events.length} event(s)`);

    const results: Array<{ email: string; event: string; success: boolean; error?: string; sync_type?: string }> = [];

    for (const webhookEvent of events) {
      const { event, email, link, reason } = webhookEvent;
      const eventDate = webhookEvent.date || new Date().toISOString();
      const campId = webhookEvent.camp_id;
      const campaignName = webhookEvent["campaign name"];

      console.log(`📊 Processing event: ${event} for ${email}`);

      try {
        // Determinar tipo de sync según el evento
        let syncType = 'email_event';
        if (event === 'contact_updated') syncType = 'inbound_update';
        else if (event === 'contact_deleted') syncType = 'inbound_delete';
        else if (event === 'list_addition') syncType = 'inbound_list';

        // Tablas de leads
        const tables = [
          { name: 'company_valuations', emailField: 'email' },
          { name: 'contact_leads', emailField: 'email' },
          { name: 'collaborator_applications', emailField: 'email' },
          { name: 'acquisition_leads', emailField: 'email' },
          { name: 'company_acquisition_inquiries', emailField: 'email' },
        ];

        let updated = false;
        let attributesReceived: Record<string, any> = {};
        let attributesUpdated: Record<string, any> = {};

        // Manejar eventos especiales de contacto
        if (event === 'contact_updated' && webhookEvent.content) {
          // Procesar actualización de atributos desde Brevo
          attributesReceived = webhookEvent.content.reduce((acc, item) => ({ ...acc, ...item }), {});
          
          // Mapear atributos de Brevo a campos locales
          for (const [brevoAttr, localField] of Object.entries(BREVO_ATTRIBUTE_MAP)) {
            if (attributesReceived[brevoAttr] !== undefined) {
              attributesUpdated[localField] = attributesReceived[brevoAttr];
            }
          }

          // === CRITICAL: UPSERT to master 'contactos' table ===
          const contactoData: Record<string, any> = {
            email: email,
            updated_at: new Date().toISOString(),
            brevo_synced_at: new Date().toISOString(),
          };
          
          // Map Brevo attributes to contactos fields (correct schema)
          if (attributesReceived.FIRSTNAME) contactoData.nombre = attributesReceived.FIRSTNAME;
          if (attributesReceived.LASTNAME) contactoData.apellidos = attributesReceived.LASTNAME;
          if (attributesReceived.SMS || attributesReceived.PHONE) contactoData.telefono = attributesReceived.SMS || attributesReceived.PHONE;
          if (attributesReceived.JOB_TITLE) contactoData.cargo = attributesReceived.JOB_TITLE;
          
          const { error: contactoError } = await supabase
            .from('contactos')
            .upsert(contactoData, {
              onConflict: 'email',
              ignoreDuplicates: false,
            });
          
          if (!contactoError) {
            console.log(`✅ Upserted to contactos: ${email}`);
            updated = true;
          } else {
            console.log(`⚠️ Error upserting to contactos: ${contactoError.message}`);
          }
          // === END UPSERT to contactos ===

          // Also update leads tables if we have mapped fields
          if (Object.keys(attributesUpdated).length > 0) {
            for (const table of tables) {
              const { data: records } = await supabase
                .from(table.name)
                .select('id')
                .eq(table.emailField, email)
                .limit(10);

              if (records && records.length > 0) {
                for (const record of records) {
                  const { error: updateError } = await supabase
                    .from(table.name)
                    .update({
                      ...attributesUpdated,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', record.id);

                  if (!updateError) {
                    console.log(`✅ Updated ${table.name}:${record.id} with Brevo attributes`);
                  }
                }
              }
            }
          }

          // Logging mejorado - use brevo_id for email string (TEXT field)
          await supabase.from('brevo_sync_log').insert({
            brevo_id: email,
            entity_type: 'contact',
            sync_type: syncType,
            sync_status: updated ? 'success' : 'no_match',
            sync_error: updated ? null : 'No matching records or no mappable attributes',
            attributes_sent: attributesReceived,
            response_data: { attributes_updated: attributesUpdated, contacto_synced: !contactoError },
            duration_ms: Date.now() - startTime,
            last_sync_at: new Date().toISOString(),
          });

          results.push({ email, event, success: updated, sync_type: syncType });
          continue;
        }

        if (event === 'contact_deleted') {
          // Marcar contacto como eliminado en Brevo
          for (const table of tables) {
            const { data: records } = await supabase
              .from(table.name)
              .select('id')
              .eq(table.emailField, email)
              .limit(10);

            if (records && records.length > 0) {
              for (const record of records) {
                const { error: updateError } = await supabase
                  .from(table.name)
                  .update({
                    brevo_deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', record.id);

                if (!updateError) {
                  console.log(`✅ Marked ${table.name}:${record.id} as deleted in Brevo`);
                  updated = true;
                }
              }
            }
          }

          await supabase.from('brevo_sync_log').insert({
            brevo_id: email,
            entity_type: 'contact',
            sync_type: syncType,
            sync_status: updated ? 'success' : 'no_match',
            duration_ms: Date.now() - startTime,
            last_sync_at: new Date().toISOString(),
          });

          results.push({ email, event, success: updated, sync_type: syncType });
          continue;
        }

        if (event === 'list_addition' && webhookEvent.list_id) {
          // Actualizar listas de Brevo del contacto
          const listIds = webhookEvent.list_id;
          
          for (const table of tables) {
            const { data: records } = await supabase
              .from(table.name)
              .select('id, brevo_lists')
              .eq(table.emailField, email)
              .limit(10);

            if (records && records.length > 0) {
              for (const record of records) {
                const currentLists = record.brevo_lists || [];
                const newLists = [...new Set([...currentLists, ...listIds])];

                const { error: updateError } = await supabase
                  .from(table.name)
                  .update({
                    brevo_lists: newLists,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', record.id);

                if (!updateError) {
                  console.log(`✅ Updated ${table.name}:${record.id} with list_ids: ${listIds}`);
                  updated = true;
                }
              }
            }
          }

          await supabase.from('brevo_sync_log').insert({
            brevo_id: email,
            entity_type: 'contact',
            sync_type: syncType,
            sync_status: updated ? 'success' : 'no_match',
            attributes_sent: { list_id: listIds },
            duration_ms: Date.now() - startTime,
            last_sync_at: new Date().toISOString(),
          });

          results.push({ email, event, success: updated, sync_type: syncType });
          continue;
        }

        // Procesar eventos de email (código original mejorado)
        for (const table of tables) {
          const { data: records, error: selectError } = await supabase
            .from(table.name)
            .select('id')
            .eq(table.emailField, email)
            .limit(10);

          if (selectError || !records || records.length === 0) {
            continue;
          }

          let updateData: Record<string, any> = {};

          // Añadir info de campaña si está disponible
          if (campId) {
            updateData.last_campaign_id = campId;
          }
          if (campaignName) {
            updateData.last_campaign_name = campaignName;
          }

          switch (event) {
            case 'delivered':
              updateData = {
                ...updateData,
                email_delivered: true,
                email_delivered_at: eventDate,
              };
              break;

            case 'opened':
            case 'unique_opened':
            case 'proxy_open':
              // Incrementar contador y actualizar fecha
              for (const record of records) {
                const { error: updateError } = await supabase.rpc('increment_email_opens', {
                  p_table_name: table.name,
                  p_record_id: record.id,
                  p_opened_at: eventDate,
                });
                
                if (updateError) {
                  console.log(`⚠️ Could not increment opens via RPC, using direct update`);
                  await supabase
                    .from(table.name)
                    .update({
                      email_opened: true,
                      email_opened_at: eventDate,
                      ...(campId && { last_campaign_id: campId }),
                      ...(campaignName && { last_campaign_name: campaignName }),
                    })
                    .eq('id', record.id);
                }
                updated = true;
              }
              continue;

            case 'click':
              updateData = {
                ...updateData,
                email_clicked: true,
                last_email_click_at: eventDate,
                last_clicked_url: link || null,
              };
              break;

            case 'hard_bounce':
              updateData = {
                ...updateData,
                email_bounced: true,
                email_bounce_type: 'hard',
                email_bounce_reason: reason || 'Invalid email address',
                email_valid: false,
              };
              break;

            case 'soft_bounce':
              updateData = {
                ...updateData,
                email_soft_bounced: true,
                email_bounce_type: 'soft',
                email_bounce_reason: reason || 'Temporary delivery failure',
              };
              break;

            case 'unsubscribed':
              updateData = {
                ...updateData,
                email_unsubscribed: true,
                email_unsubscribed_at: eventDate,
              };
              // Si viene list_id, también actualizar la lista
              if (webhookEvent.list_id) {
                updateData.brevo_unsubscribed_lists = webhookEvent.list_id;
              }
              break;

            case 'spam':
            case 'complaint':
              updateData = {
                ...updateData,
                email_spam_reported: true,
                email_spam_reported_at: eventDate,
              };
              break;

            case 'blocked':
            case 'invalid':
              updateData = {
                ...updateData,
                email_blocked: true,
                email_valid: false,
                email_block_reason: reason || event,
              };
              break;

            default:
              console.log(`⚠️ Unknown event type: ${event}`);
              continue;
          }

          // Aplicar update
          if (Object.keys(updateData).length > 0) {
            for (const record of records) {
              const { error: updateError } = await supabase
                .from(table.name)
                .update(updateData)
                .eq('id', record.id);

              if (!updateError) {
                console.log(`✅ Updated ${table.name}:${record.id} with ${event} event`);
                updated = true;
              }
            }
          }
        }

        // Log del evento - use brevo_id for email string (TEXT field)
        await supabase.from('brevo_sync_log').insert({
          brevo_id: email,
          entity_type: 'webhook_event',
          sync_type: syncType,
          sync_status: updated ? 'success' : 'no_match',
          sync_error: updated ? null : 'No matching records found',
          attributes_sent: { 
            event, 
            camp_id: campId, 
            campaign_name: campaignName,
            link,
            reason,
          },
          duration_ms: Date.now() - startTime,
          last_sync_at: new Date().toISOString(),
        });

        results.push({
          email,
          event,
          success: updated,
          sync_type: syncType,
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

    console.log(`📊 Processed ${results.length} events, ${results.filter(r => r.success).length} successful in ${Date.now() - startTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        duration_ms: Date.now() - startTime,
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
