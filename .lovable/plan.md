

# Plan: Duplicación completa de campañas outbound (incluyendo presentaciones y valoraciones)

## Diagnóstico

La función `duplicateCampaign` en `useCampaigns.ts` ya copia presentaciones del bucket `campaign-presentations`, pero tiene dos problemas:

1. **PDFs de valoración no se copian**: `pdf_url` se fuerza a `null` y los archivos en el bucket `valuations` no se duplican.
2. **Datos de empresa se resetean**: Campos como `ai_strengths`, `ai_weaknesses`, `ai_context`, `valuation_low/central/high`, `multiple_used`, `range_label`, `client_website`, `client_provincia` se pierden al duplicar.
3. **Campos faltantes**: `client_website` y `client_provincia` no se incluyen en el clone.

## Cambios

### Archivo: `src/hooks/useCampaigns.ts`

**Refactorizar `clonedCompanies`** (líneas 147-179) para preservar todos los datos:

- Copiar TODOS los campos excepto `id`, `campaign_id`, `created_at` y campos de seguimiento/envío
- Mantener: `pdf_url`, `ai_strengths`, `ai_weaknesses`, `ai_context`, `ai_enriched`, `valuation_low`, `valuation_central`, `valuation_high`, `multiple_used`, `range_label`, `client_website`, `client_provincia`, `normalized_ebitda`, `custom_multiple`
- Resetear solo: `status` → `'pending'`, `error_message` → `null`, `follow_up_status` → `null`, `follow_up_count` → `0`, `seguimiento_estado` → `null`, `seguimiento_notas` → `null`, `followup_enviado` → `false`, `followup_sent_at` → `null`, `last_interaction_at` → `null`, `is_auto_assigned` → `false`

**Añadir copia de PDFs de valoración** (tras insertar empresas):

- Iterar las empresas clonadas que tengan `pdf_url`
- Construir la ruta nueva reemplazando el `campaign_id` viejo por el nuevo
- Usar la Edge Function `upload-campaign-presentation` con `action: 'copy'` (usa el bucket `campaign-presentations`... necesito verificar si las valoraciones están en otro bucket)

Alternativa más limpia: como las valoraciones se almacenan en el bucket `valuations` con ruta basada en `professional_valuation_id`, y el campo `professional_valuation_id` se setea a `null`, copiar los archivos directamente en storage y actualizar `pdf_url` con la nueva ruta.

**Necesito verificar**: ¿Dónde se guardan exactamente los PDFs de valoración? Si están en `valuations` bucket con path basado en company/campaign ID, la copia requiere una acción de storage adicional.

### Edge Function: `upload-campaign-presentation`

Si los PDFs de valoración están en un bucket diferente (`valuations`), extender la Edge Function para soportar copias entre buckets, o crear la lógica de copia directamente en el cliente usando signed URLs.

### Resultado esperado

Al duplicar una campaña, la nueva copia incluirá:
- Todas las empresas con sus datos financieros, AI y de contacto intactos
- Las presentaciones/estudios PDF copiados físicamente
- Los PDFs de valoración copiados al nuevo path
- Solo los campos de estado operativo (envío, seguimiento) reseteados

