

## Diagnostico

El problema esta en `src/hooks/useCampaignEmails.ts`, lineas 213-247. Tanto `sendEmailMutation` como `sendAllPendingMutation` solo hacen un UPDATE en la tabla `campaign_emails` marcando `status: 'sent'`, pero **nunca invocan una Edge Function para enviar el email real via Resend**. El propio codigo tiene el comentario: *"For now, just mark as sent. Real delivery via edge function later."*

No existe ninguna Edge Function dedicada al envio de emails de campanas outbound.

## Plan

### 1. Crear Edge Function `send-campaign-outbound-email`

Nueva funcion en `supabase/functions/send-campaign-outbound-email/index.ts` que:
- Reciba `email_id` (o array de `email_ids`) por JSON
- Consulte `campaign_emails` + `campaign_companies` + `campaign_presentations` + `valuation_campaigns` con `service_role`
- Construya el email HTML con el `subject` y `body` ya personalizados del registro
- Adjunte los PDFs de valoracion y estudio si existen (via signed URLs internas con `service_role`)
- Envie via Resend desde `samuel@capittal.es` con CC a los destinatarios activos de `email_recipients_config`
- Actualice `status: 'sent'` y `sent_at` en exito, o `status: 'error'` + `error_message` en fallo
- CORS y auth estandar del proyecto

### 2. Actualizar `useCampaignEmails.ts`

- `sendEmailMutation`: invocar `supabase.functions.invoke('send-campaign-outbound-email', { body: { email_ids: [emailId] } })` en lugar del UPDATE directo
- `sendAllPendingMutation`: invocar la misma funcion con todos los IDs pendientes
- Gestionar errores parciales (algunos enviados, otros fallidos)

### 3. Configuracion

- Añadir entrada en `supabase/config.toml` con `verify_jwt = false`
- Desplegar y verificar con test

### Archivos afectados
- `supabase/functions/send-campaign-outbound-email/index.ts` (nuevo)
- `supabase/config.toml` (nueva entrada)
- `src/hooks/useCampaignEmails.ts` (conectar envio real)

