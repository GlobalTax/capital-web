

## Plan: Duplicar campañas incluyendo empresas

### Problema actual
La duplicacion actual solo copia la configuracion de `valuation_campaigns`. No copia las filas de `valuation_campaign_companies`, por lo que la campaña duplicada queda vacia.

### Solucion
Modificar `duplicateMutation` en `useCampaigns.ts` para que, tras crear la nueva campaña, copie todas las empresas asociadas reseteando sus estados de envio.

### Cambios en `src/hooks/useCampaigns.ts`

Dentro de `duplicateMutation.mutationFn`, despues de insertar la nueva campaña:

1. Fetch todas las empresas de la campaña original desde `valuation_campaign_companies`
2. Para cada empresa, insertar una copia en la nueva campaña con:
   - `campaign_id` → nuevo ID
   - Campos copiados: `client_company`, `client_name`, `client_email`, `client_phone`, `client_cif`, `ebitda`, `revenue`, `financial_year`, `financial_years_data`, `excel_row_number`, `source`, `custom_multiple`
   - Campos reseteados a null/default: `status` → `'imported'`, `pdf_url` → null, `error_message` → null, `ai_strengths` → null, `ai_weaknesses` → null, `ai_context` → null, `ai_enriched` → false, `valuation_low/central/high` → null, `multiple_used` → null, `range_label` → null, `follow_up_status` → null, `follow_up_count` → 0, `professional_valuation_id` → null
3. Actualizar `total_companies` de la nueva campaña con el count de empresas copiadas

### Sin cambios en UI
El boton de duplicar ya existe. Solo cambia la logica del mutation para incluir empresas.

### Archivo afectado
- `src/hooks/useCampaigns.ts` — ampliar `duplicateMutation`

