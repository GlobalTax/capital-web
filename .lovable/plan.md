

## Plan: Informe PDF Semanal Outbound (Domingos 08:00)

### Enfoque

Crear una Edge Function `send-weekly-outbound-pdf` que genera un PDF detallado usando **jsPDF + autoTable** (compatibles con Deno) y lo envía adjunto por email cada domingo.

### Datos del PDF

El informe incluirá estas secciones:

1. **Portada**: Logo Capittal, título "Informe Semanal Outbound", rango de fechas (lunes-domingo)

2. **KPIs Globales de la Semana** (tabla resumen):
   - Empresas contactadas, emails enviados, entregados, rebotados
   - Abiertos + tasa apertura, contestados + tasa contestación
   - Interesados, reuniones, no interesados
   - **Delta vs semana anterior** (↑↓ porcentual)

3. **Desglose por Campaña** (tabla):
   - Nombre, sector, empresas, enviados, abiertos, tasa, contestados, interesados, reuniones, no interesados

4. **Follow-ups Enviados** (tabla por ronda):
   - Datos de `campaign_followup_sends` agrupados por `sequence_number`
   - Enviados, abiertos, tasa apertura por ronda (FU1, FU2...)

5. **Empresas con Respuesta** (tabla detallada):
   - Empresa, campaña, estado (interesado/reunión/no interesado), notas
   - Filtro: `seguimiento_estado` distinto de `sin_respuesta` y no null

6. **Interacciones Registradas** (tabla):
   - Datos de `campaign_company_interactions` de la semana
   - Empresa, tipo (llamada/reunión/WhatsApp...), título, resultado, fecha

7. **Evolución Temporal** (tabla comparativa):
   - Semana actual vs anterior: valoraciones enviadas, aperturas, contestaciones, con deltas %

### Implementación

**Crear**: `supabase/functions/send-weekly-outbound-pdf/index.ts`
- Usa `jsPDF` (https://esm.sh/jspdf@2.5.2) + `jspdf-autotable` (https://esm.sh/jspdf-autotable@3.8.4) para generar el PDF en Deno
- Consulta 6 tablas: `valuation_campaigns`, `campaign_emails`, `valuation_campaign_companies`, `campaign_followup_sends`, `campaign_followup_sequences`, `campaign_company_interactions`
- Calcula rangos: semana actual (lun-dom) y semana anterior para comparativas
- Genera PDF con tablas bien formateadas, colores corporativos y badges de estado
- Envía vía Resend con PDF adjunto (Base64) a los 4 RECIPIENTS habituales
- Email con asunto tipo "📊 Informe Semanal Outbound — 10-16 Mar 2026"

**Modificar**: `supabase/config.toml`
- Añadir `[functions.send-weekly-outbound-pdf] verify_jwt = false`

**SQL** (insert tool): Cron job `0 8 * * 0` para ejecución automática domingos 08:00

### Archivos
- **Crear**: `supabase/functions/send-weekly-outbound-pdf/index.ts`
- **Modificar**: `supabase/config.toml`

