

## Plan: Informe Outbound por Email (Diario + Semanal)

### Qué se construye

Una nueva Edge Function `send-outbound-report` que consulta los mismos datos que el dashboard (`valuation_campaigns`, `campaign_emails`, `valuation_campaign_companies`), calcula los KPIs para dos períodos (ayer y semana en curso), genera un email HTML con ambas secciones y lo envía a los 4 destinatarios. Se programa con cron diario y se expone para invocación manual (prueba).

### Estructura del email

```text
┌─────────────────────────────────────────────┐
│  📊 Informe Outbound - [fecha]              │
├─────────────────────────────────────────────┤
│  RESUMEN DEL DÍA ANTERIOR                  │
│  Empresas | Enviados | Abiertos | Tasa Ap.  │
│  Contestados | Interesados | Reuniones      │
├─────────────────────────────────────────────┤
│  RESUMEN DE LA SEMANA (lunes → hoy)         │
│  Mismos KPIs agregados                      │
├─────────────────────────────────────────────┤
│  DESGLOSE POR CAMPAÑA (tabla)               │
│  Nombre | Enviados | Abiertos | Tasa | ...  │
└─────────────────────────────────────────────┘
```

### Implementacion

**1. Nueva Edge Function `send-outbound-report/index.ts`**

- Consulta `valuation_campaigns` (todas activas), `campaign_emails` (con `sent_at`, `company_id`, `status`, `delivery_status`, `email_opened`), y `valuation_campaign_companies` (`seguimiento_estado`, `id`, `campaign_id`)
- Calcula KPIs para dos rangos: "ayer" (00:00-23:59 del día anterior) y "semana" (lunes de la semana actual hasta ahora)
- KPIs: Empresas, Enviados, Entregados, Rebotados, Abiertos, Tasa Apertura, Contestados (interesados+reuniones+no_interesados), Tasa Contestación
- Funnel: Sin respuesta, Interesados, Reuniones, No interesados
- Tabla de desglose por campaña con los mismos campos
- Envía vía Resend a `samuel@capittal.es`, `lluis@capittal.es`, `oriol@capittal.es`, `marcc@capittal.es`
- Remitente: `Capittal <samuel@capittal.es>`
- Sigue el patrón de `daily-hours-report` (CORS, logging, Resend)

**2. Cron job (SQL)** — Programar ejecución diaria a las 09:00

**3. Invocación de prueba** — Tras el deploy, invocar la función para enviar el primer informe de prueba

### Archivos

| Archivo | Acción |
|---------|--------|
| `supabase/functions/send-outbound-report/index.ts` | Crear |
| `supabase/config.toml` | Añadir `[functions.send-outbound-report]` con `verify_jwt = false` |
| Cron job SQL | Ejecutar tras deploy |

