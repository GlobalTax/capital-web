
# Plan: Solución al Timeout de Firecrawl para Dealsuite

## Problema Identificado

El scraping de Dealsuite falla con error **408 SCRAPE_TIMEOUT** porque:
- La página es muy pesada en JavaScript (SPA con React)
- Requiere autenticación y carga muchos datos dinámicamente
- El tiempo actual (15s waitFor, 60s timeout) es insuficiente

## Solución Propuesta

### Estrategia Principal: Firecrawl Async Mode + Polling

En lugar de esperar síncronamente a que Firecrawl complete el scrape (lo que causa timeout en la edge function), usaremos el **modo asíncrono** de Firecrawl:

1. Iniciar el scrape con `/v1/scrape` en modo async
2. Recibir un `jobId` inmediatamente
3. Hacer polling cada 5 segundos al endpoint `/v1/scrape/{jobId}`
4. Cuando el job termine, procesar los resultados

### Cambios en la Edge Function

**Archivo:** `supabase/functions/dealsuite-scrape-wanted/index.ts`

1. **Aumentar timeouts significativamente:**
   - `waitFor: 30000` (30 segundos - el máximo recomendado)
   - `timeout: 120000` (120 segundos - el máximo de Firecrawl)

2. **Implementar retry con backoff:**
   - Primer intento: timeout estándar
   - Si falla con 408: reintentar con `waitFor: 45000`
   - Máximo 2 reintentos

3. **Añadir configuración avanzada de Firecrawl:**
   - `skipTlsVerification: true` (evitar bloqueos por SSL)
   - `blockAds: true` (cargar más rápido)
   - `removeCookieBanners: true`

### Mejoras en la UI

**Archivo:** `src/components/admin/DealsuiteSyncPanel.tsx`

1. **Mostrar feedback de progreso más detallado:**
   - Indicar "Cargando página..." durante el scrape
   - Mostrar tiempo transcurrido
   - Botón de cancelar

2. **Mostrar errores más descriptivos:**
   - Si es timeout, sugerir reintentar
   - Si es cookie expirada, indicar cómo renovarla

3. **Añadir opción de "Modo Ligero":**
   - Scrape solo la primera página (sin paginación)
   - Para pruebas rápidas

### Flujo Técnico Actualizado

```text
Usuario ingresa cookie
         |
         v
+------------------+
| Validar cookie   |
+------------------+
         |
         v
+------------------+     timeout?     +------------------+
| Firecrawl scrape |----------------->| Retry con más    |
| waitFor: 30s     |                  | tiempo (45s)     |
| timeout: 120s    |                  +------------------+
+------------------+                           |
         |                                     |
         v                                     v
+------------------+                  +------------------+
| Procesar con AI  |<-----------------| Procesar con AI  |
| GPT-4o-mini      |                  | GPT-4o-mini      |
+------------------+                  +------------------+
         |
         v
+------------------+
| Upsert deals     |
| en Supabase      |
+------------------+
```

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `supabase/functions/dealsuite-scrape-wanted/index.ts` | Aumentar timeouts, añadir retry logic, mejorar logs |
| `src/components/admin/DealsuiteSyncPanel.tsx` | Feedback de progreso, manejo de errores mejorado |

## Sección Técnica

### Configuración Firecrawl Optimizada

```typescript
body: JSON.stringify({
  url,
  formats: ['markdown'],
  waitFor: 30000,
  timeout: 120000,
  onlyMainContent: true,
  blockAds: true,
  removeCookieBanners: true,
  headers: {
    'Cookie': session_cookie,
    'User-Agent': 'Mozilla/5.0...',
    'Referer': 'https://app.dealsuite.com/',
    'Cache-Control': 'no-cache',
  }
})
```

### Lógica de Retry

```typescript
async function scrapeWithRetry(url: string, cookie: string, attempt = 1): Promise<Response> {
  const waitTimes = [30000, 45000, 60000];
  const waitFor = waitTimes[attempt - 1] || 60000;
  
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', { ... });
  
  if (!response.ok && response.status === 408 && attempt < 3) {
    console.log(`Retry attempt ${attempt + 1} with waitFor: ${waitTimes[attempt]}`);
    await new Promise(r => setTimeout(r, 2000));
    return scrapeWithRetry(url, cookie, attempt + 1);
  }
  
  return response;
}
```

## Notas Importantes

- La cookie de Dealsuite expira aproximadamente cada 24 horas
- Se recomienda ejecutar la sincronización durante horas de baja carga (noche/madrugada)
- Si persisten los timeouts, considerar implementar scraping por paginación (página por página)
