
# Plan: Corregir CORS en process-blog-quick-create

## Problema Detectado

La Edge Function `process-blog-quick-create` está bloqueando peticiones desde `https://capittal.es` porque los headers CORS están incompletos.

**Error actual:**
```
Access to fetch at '.../process-blog-quick-create' from origin 'https://capittal.es' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Causa Raíz

El header `Access-Control-Allow-Headers` no incluye todos los headers que el cliente Supabase envía automáticamente:

| Header faltante | Descripción |
|-----------------|-------------|
| `x-supabase-client-platform` | Plataforma del cliente |
| `x-supabase-client-platform-version` | Versión de la plataforma |
| `x-supabase-client-runtime` | Runtime del cliente |
| `x-supabase-client-runtime-version` | Versión del runtime |

Cuando el navegador hace la petición preflight (OPTIONS), el servidor rechaza estos headers y el navegador bloquea la petición real.

## Solución

Actualizar los headers CORS en `supabase/functions/process-blog-quick-create/index.ts`:

```typescript
// ANTES (líneas 3-6)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// DESPUÉS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/process-blog-quick-create/index.ts` | Actualizar `corsHeaders` (línea 5) |

## Verificación

Tras el deploy automático:
1. Navegar a `/admin/blog-v2`
2. Usar la función "Quick Create" para crear un borrador
3. Verificar que no aparece el error CORS en la consola

## Nota sobre otros errores

Los demás errores en la consola son:

- **Chrome extensions** (`[SW] Skipping unsupported scheme`): Normales, provienen de extensiones del navegador
- **WebSocket cerrado antes de establecerse**: Problema transitorio de red de Supabase Realtime, no requiere acción
- **`runtime.lastError: message port closed`**: Error de extensiones de Chrome, no relacionado con la aplicación
