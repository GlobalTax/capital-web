
# Fix: Notificaciones Diarias No Funcionan

## Diagnostico

Se han identificado **4 cron jobs diarios** que llaman a Edge Functions que **no existen** en el codigo del proyecto:

| Cron Job | Horario | Funcion que llama | Estado |
|---|---|---|---|
| `daily-incomplete-valuations-report` | 09:00 cada dia | `daily-incomplete-report` | NO EXISTE |
| `daily-incomplete-valuations-report-afternoon` | 14:00 cada dia | `daily-incomplete-report` | NO EXISTE |
| `daily-hours-report` | 08:00 Lunes-Viernes | `daily-hours-report` | NO EXISTE |
| `daily-alerts` | 08:00 cada dia | `run-alerts-cron` | NO EXISTE |
| `send-news-digest-job` | 07:00 cada dia | `send-news-digest` | FUNCIONA OK |

El digest de noticias funciona correctamente (probado ahora mismo). Los otros 3 endpoints estan siendo invocados por pg_cron pero responden con error porque las funciones nunca fueron creadas.

## Plan de solucion

### 1. Crear Edge Function `daily-incomplete-report`

Reporte diario de valoraciones incompletas enviado por email al equipo interno. Basado en la logica ya existente en `generate-scheduled-reports`:

- Consulta `company_valuations` de las ultimas 24h sin `final_valuation`
- Filtra duplicados por IP (misma logica ya implementada)
- Envia email HTML al equipo interno con tabla de valoraciones abandonadas
- Incluye metricas: total, por step, por sector

### 2. Crear Edge Function `daily-hours-report`

Reporte diario de actividad/horas de trabajo para dias laborables (L-V):

- Consulta actividad reciente del equipo
- Resume metricas clave del dia anterior (valoraciones procesadas, leads gestionados, emails enviados)
- Envia resumen al equipo interno

### 3. Crear Edge Function `run-alerts-cron`

Ejecuta alertas diarias para compradores/operaciones:

- Usa la logica de `send-operation-alerts` existente como base
- Verifica buyer_preferences activas
- Envia alertas de nuevas operaciones que coincidan con preferencias

### Archivos a crear

| Archivo | Descripcion |
|---|---|
| `supabase/functions/daily-incomplete-report/index.ts` | Reporte de valoraciones incompletas |
| `supabase/functions/daily-hours-report/index.ts` | Resumen diario de actividad |
| `supabase/functions/run-alerts-cron/index.ts` | Alertas diarias de operaciones |

### Configuracion

- Actualizar `supabase/config.toml` con `verify_jwt = false` para las 3 nuevas funciones
- Los cron jobs ya existen en `cron.job`, no hay que modificarlos
- Se usa `RESEND_API_KEY` para envio de emails (ya configurada) y `SUPABASE_SERVICE_ROLE_KEY` para acceso completo a datos

### Protocolo de emails

Siguiendo el protocolo unificado existente:
- Sender: `samuel@capittal.es`
- Reply-To: `info@capittal.es`
- Destinatarios internos: samuel, marcc, marc, oriol, lluis, marcel, albert @capittal.es
