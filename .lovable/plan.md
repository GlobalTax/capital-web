## ✅ Completado: Eliminar meta http-equiv="refresh" de todas las funciones SSR

### Cambios realizados

1. **`blog-ssr/index.ts`**: Eliminado `<meta http-equiv="refresh">`, CSS `.redirect-note` y párrafo "Redirigiendo".
2. **`news-ssr/index.ts`**: Eliminado `<meta http-equiv="refresh">`, CSS `.redirect-note` y párrafo "Redirigiendo".
3. **`pages-ssr/index.ts`**: Eliminado `<meta http-equiv="refresh">`, CSS `.redirect-note` y párrafo "Redirigiendo".
4. **`prerender-proxy/index.ts`**: Eliminado `<meta http-equiv="refresh">` del fallback HTML y reemplazado texto "Redirigiendo" por enlace estático.

### Resultado

- Las páginas SSR son ahora contenido final para bots, sin señales de redirección.
- Google indexará el contenido directamente en lugar de seguir un refresh.
- Verificado con curl: la respuesta de pages-ssr ya no contiene `http-equiv="refresh"`.

---

## ✅ Completado: og:url estático + SSR para noticias individuales

### Cambios realizados

1. **`index.html`**: Añadido `<meta property="og:url">` estático en el `<head>` + actualización dinámica en el script síncrono junto al canonical.

2. **`supabase/functions/news-ssr/index.ts`** (NUEVO): Edge function que genera HTML completo para `/recursos/noticias/:slug` con title, description, canonical, og:url, og:image, structured data (NewsArticle + BreadcrumbList + Organization) y breadcrumbs.

3. **`supabase/functions/prerender-proxy/index.ts`**: Añadido routing de `/recursos/noticias/:slug` → `news-ssr?slug=...` (antes iba a `pages-ssr` que devolvía metadata genérica).

4. **`supabase/config.toml`**: Registrada `news-ssr` con `verify_jwt = false`.

### Resultado

- Bots ven `og:url` en el HTML estático de todas las páginas (sin necesidad de JS)
- Noticias individuales tienen SSR completo con metadatos únicos por artículo
- Verificado con curl: título, canonical, og:url y structured data correctos

---

## ✅ Completado: Limpiar schemas JSON-LD en index.html

### Cambios realizados

- **Eliminado** `FinancialService` schema del `<head>` (era específico de páginas de servicios)
- **Eliminado** `FAQPage` schema del `<head>` (era específico de páginas con FAQ)
- **Mantenido** `Organization` schema (válido globalmente)
- **Mantenido** `WebPage` schema (válido globalmente)

### Resultado

- Solo quedan 2 schemas globales en `index.html`: Organization y WebPage
- FinancialService y FAQPage deben inyectarse dinámicamente vía `SEOHead` en sus páginas correspondientes

---

## ✅ Completado: Integración Lista de Contacto → Campaña Outbound

### Cambios realizados

1. **Migración SQL**: Añadida columna `source_list_id` (uuid) a `valuation_campaigns` con FK a `outbound_lists`.

2. **`src/components/admin/contact-lists/SendToCampaignDialog.tsx`** (NUEVO): Diálogo completo para enviar empresas de una lista a una campaña outbound. Incluye:
   - Selección entre crear nueva campaña o añadir a existente
   - Deduplicación por CIF contra la campaña destino (omite duplicados)
   - Deduplicación cross-campaña (aviso de empresas ya contactadas en otras campañas)
   - Mapeo automático de campos lista → campaña
   - Inserción en batches de 100

3. **`src/components/admin/campanas-valoracion/ImportFromListDialog.tsx`** (NUEVO): Diálogo para importar empresas desde lista dentro del paso 2 (CompaniesStep) de una campaña. Misma lógica de deduplicación.

4. **`src/pages/admin/ContactListDetailPage.tsx`**: Botón "Enviar a campaña" en la toolbar de acciones de la lista.

5. **`src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx`**: Botón "Importar desde lista de contacto" antes del formulario manual.

6. **`src/pages/admin/CampanasValoracion.tsx`**: Badge con nombre de lista origen junto al nombre de la campaña (clickable, navega a la lista).

7. **`src/hooks/useCampaigns.ts`**: Añadido `source_list_id` al tipo `ValuationCampaign`.

### Resultado

- Flujo directo lista → campaña con un solo clic
- Protección anti-duplicados a nivel de campaña y cross-campaña
- Trazabilidad: cada campaña muestra su lista origen

---

## ✅ Completado: Sistema de envío automático server-side para Outbound

### Cambios realizados

1. **Migration SQL**: Nueva tabla `outbound_send_queue` con campos: id, campaign_id, send_type, sequence_id, email_ids, interval_ms, max_per_hour, scheduled_at, status, progress_current, progress_total, last_processed_at, error_message, created_by, created_at, updated_at. RLS habilitado.

2. **`supabase/functions/process-outbound-queue/index.ts`** (NUEVO): Worker Edge Function que:
   - Marca jobs estancados (>10min sin progreso) como `failed`
   - Busca jobs `pending` con `scheduled_at <= now()` o `running`
   - Calcula emails a enviar por ventana de 2min respetando `interval_ms` y `max_per_hour`
   - Llama a `send-campaign-outbound-email` existente para cada email
   - Actualiza progreso en tiempo real y marca como `completed` al terminar
   - Re-verifica status del job entre emails (para soportar pausa/cancelación)

3. **`src/hooks/useOutboundQueue.ts`** (NUEVO): Hook React que expone:
   - `jobs`, `activeJobs`, `hasActiveJob`
   - `createJob` mutation para insertar en la cola
   - `updateJobStatus` mutation para pausar/reanudar/cancelar
   - Polling cada 10s para actualización de progreso en tiempo real

4. **`src/components/admin/campanas-valoracion/shared/OutboundQueueMonitor.tsx`** (NUEVO): Panel de monitorización con:
   - Lista de jobs con badge de estado (Programado/En curso/Pausado/Completado/Fallido/Cancelado)
   - Barra de progreso para jobs activos
   - Botones de Pausar/Reanudar/Cancelar

5. **`src/components/admin/campanas-valoracion/shared/SendScheduleConfig.tsx`**: Añadido campo `serverSide` al tipo `SendScheduleSettings`. Nuevo selector "Modo de envío" con opciones:
   - "Desde el navegador" (comportamiento actual)
   - "Server-side (automático)" → inserta job en cola, no requiere navegador abierto

6. **`ProcessSendStep.tsx`**: Integrado `useOutboundQueue`. Al enviar con modo server-side, crea job en cola con IDs de campaign_emails.

7. **`DocumentSendStep.tsx`**: Mismo patrón: modo server-side crea job tipo 'document' en la cola.

8. **`FollowUpStep.tsx`**: Añadido `OutboundQueueMonitor` en la vista.

9. **`supabase/config.toml`**: Registrada función `process-outbound-queue` con `verify_jwt = false`.

### Pendiente: pg_cron job

Ejecutar en el SQL Editor de Supabase:
```sql
SELECT cron.schedule(
  'process-outbound-queue',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/process-outbound-queue',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I"}'::jsonb,
    body:='{"time": "now"}'::jsonb
  ) AS request_id;
  $$
);
```

### Resultado

- Los envíos programados pueden ejecutarse en segundo plano sin necesidad de mantener el navegador abierto
- El worker procesa la cola cada 2 minutos respetando intervalos y límites horarios
- Soporte para pausar, reanudar y cancelar envíos en curso
- Panel de monitorización integrado en los 3 pasos de envío (Inicial, Documento, Follow-up)
