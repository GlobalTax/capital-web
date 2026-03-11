

## Diagnostico

El problema está en `ProcessSendStep.tsx`. Las funciones `sendSingle` (línea 550) y `handleSendEmails` (línea 771) invocan directamente `send-professional-valuation-email`, que genera y envía su propio template HTML de valoración profesional.

Lo que debería ocurrir es:
1. El email usa el **template personalizado** definido en el paso 6 (Mail) — almacenado en `campaign_emails.subject` y `campaign_emails.body`
2. Adjunta el **PDF de valoración** (generado o almacenado)
3. Adjunta el **PDF de presentación/estudio** (subido en paso 4)

La Edge Function `send-campaign-outbound-email` ya hace exactamente esto: lee subject/body de `campaign_emails`, adjunta los PDFs de `campaign_presentations`, y envía via Resend. Pero ProcessSendStep nunca la usa.

## Plan

### 1. Refactorizar `sendSingle` y `handleSendEmails` en ProcessSendStep.tsx

Reemplazar las llamadas a `send-professional-valuation-email` por `send-campaign-outbound-email`:

- **`sendSingle(c)`**: Buscar el `campaign_email` correspondiente a `c.id` (company_id), obtener su `email.id`, e invocar `send-campaign-outbound-email` con `{ email_ids: [email.id] }`.
- **`handleSendEmails`**: Igual, recopilar los IDs de `campaign_emails` de las empresas `readyToSend` e invocar la función con todos los IDs.
- Eliminar la generación de PDF en el cliente (`generatePdfBase64`, `generatePdfBlob`) de estos flujos, ya que la Edge Function obtiene los PDFs directamente del storage.

### 2. Prerequisito: emails generados

Para que esto funcione, los emails deben estar generados en `campaign_emails` antes de enviar desde el paso 5. Añadir una validación que verifique que existe un registro en `campaign_emails` para cada empresa antes de permitir el envío, o generar automáticamente los emails si no existen.

### 3. Conectar datos

ProcessSendStep necesita acceso a los emails de la campaña. Opciones:
- Importar `useCampaignEmails` en ProcessSendStep para obtener los emails y usar `sendEmail`/`sendAllPending`
- O simplemente hacer un query para obtener los IDs de `campaign_emails` por `company_id`

### Archivos afectados
- `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` — refactorizar `sendSingle` y `handleSendEmails` para usar `send-campaign-outbound-email`

