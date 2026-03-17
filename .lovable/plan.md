

## Plan: Sistema de envío automático server-side para Outbound

### Problema actual
El envío programado es **client-side**: usa `setTimeout` en el navegador, por lo que la pestaña debe permanecer abierta. Si se cierra, el envío se cancela.

### Solución: Cola de envío server-side con pg_cron

#### 1. Nueva tabla `outbound_send_queue`

Almacena los trabajos de envío programados:

```text
outbound_send_queue
├── id (uuid PK)
├── campaign_id (FK → valuation_campaigns)
├── send_type ('initial' | 'followup')
├── sequence_id (nullable, para followups)
├── email_ids (text[] — IDs de campaign_emails o campaign_followup_sends)
├── interval_ms (int, delay entre emails)
├── max_per_hour (int nullable)
├── scheduled_at (timestamptz — cuándo comenzar)
├── status ('pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled')
├── progress_current (int default 0)
├── progress_total (int)
├── last_processed_at (timestamptz)
├── error_message (text nullable)
├── created_by (uuid FK → auth.users)
├── created_at / updated_at
```

#### 2. Nueva Edge Function `process-outbound-queue`

- Invocada por pg_cron cada 2 minutos
- Busca jobs con `status = 'pending'` y `scheduled_at <= now()`, o `status = 'running'`
- Para cada job:
  - Calcula cuántos emails puede enviar respetando `interval_ms` y `max_per_hour` dentro del window de 2 min
  - Llama a la Edge Function existente `send-campaign-outbound-email` con lotes pequeños (1-3 IDs)
  - Actualiza `progress_current` y `last_processed_at` tras cada envío
  - Si se completan todos, marca `status = 'completed'`
- Timeout safety: si `last_processed_at` es > 10 min sin progreso, marca como `failed`

#### 3. Cron job (pg_cron + pg_net)

```sql
SELECT cron.schedule(
  'process-outbound-queue',
  '*/2 * * * *',  -- cada 2 minutos
  $$ SELECT net.http_post(...) $$
);
```

#### 4. Cambios en UI (ProcessSendStep + DocumentSendStep + FollowUpStep)

- Al pulsar "Programar envío" con fecha futura → **inserta un registro en `outbound_send_queue`** en lugar de hacer countdown client-side
- Nuevo indicador visual: badge "Envío programado para [fecha]" con opción de cancelar (marca `status = 'cancelled'`)
- Progreso en tiempo real: polling cada 10s sobre el registro del queue para mostrar `progress_current / progress_total`
- Mantener la opción "Enviar ahora" como está (client-side directo, sin pasar por la cola)

#### 5. Panel de monitorización

Pequeño panel en la vista de campaña que muestra los jobs activos/programados:
- Estado (Pendiente / En curso / Completado / Fallido)  
- Progreso (ej: "45/120 emails enviados")
- Hora programada y última actividad
- Botones: Pausar / Reanudar / Cancelar

### Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| Migration SQL | Nueva tabla `outbound_send_queue` |
| `supabase/functions/process-outbound-queue/index.ts` | Nueva Edge Function (worker) |
| `supabase/config.toml` | Registrar nueva función |
| pg_cron SQL (insert tool) | Programar cron cada 2 min |
| `src/components/admin/campanas-valoracion/shared/SendScheduleConfig.tsx` | Añadir modo "server-side" |
| `src/components/admin/campanas-valoracion/shared/OutboundQueueMonitor.tsx` | Nuevo panel de monitorización |
| `ProcessSendStep.tsx` | Integrar creación de job en queue |
| `DocumentSendStep.tsx` | Integrar creación de job en queue |
| `FollowUpStep.tsx` | Integrar creación de job en queue |

