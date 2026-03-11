

# Duplicación completa de campañas ("Copiar limpio")

## Diagnóstico

La duplicación actual copia correctamente:
- Configuración de campaña (incluyendo templates de email/followup)
- Empresas (`valuation_campaign_companies`) con datos y valoraciones
- Presentaciones (`campaign_presentations`) + archivos en storage

Pero **no copia**:
1. **`campaign_emails`** — los emails personalizados por empresa (subject + body generados en paso 6). Sin ellos, al abrir la campaña duplicada el paso Mail aparece vacío y hay que regenerar todos.
2. **`campaign_followup_sequences`** — las rondas de follow-up con sus templates (subject, body_html). Sin ellas, el paso 8 aparece vacío.

Dado que quieres "copiar limpio" (conservar contenido, reiniciar estado operativo), el plan es:

## Cambios en `src/hooks/useCampaigns.ts` — función `duplicateMutation`

### 1. Copiar `campaign_emails` (con reset de estado)

Después de copiar empresas y tener el `companyIdMap`:

- Fetch todos los `campaign_emails` de la campaña original
- Para cada email, insertar un nuevo registro con:
  - `campaign_id` → nueva campaña
  - `company_id` → mapeado via `companyIdMap`
  - `subject`, `body`, `is_manually_edited` → conservados
  - `status` → `'pending'`
  - `sent_at`, `error_message`, `email_message_id`, `email_opened`, `email_opened_at`, `delivery_status` → reseteados a null/defaults

### 2. Copiar `campaign_followup_sequences` (templates de ronda)

- Fetch todas las `campaign_followup_sequences` de la campaña original
- Insertar clones con `campaign_id` → nueva campaña, conservando `sequence_number`, `label`, `subject`, `body_html`
- NO copiar `campaign_followup_sends` (son envíos operativos)

### 3. NO copiar (decisión "copiar limpio")

- `campaign_followups` (legacy, operativo)
- `campaign_followup_sends` (envíos realizados)
- `campaign_company_interactions` (historial de interacciones)

## Archivo afectado

- `src/hooks/useCampaigns.ts` — ampliar `duplicateMutation.mutationFn` con las 2 secciones adicionales de copia

