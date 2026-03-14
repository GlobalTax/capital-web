
Objetivo: cerrar definitivamente la verificación de Ahrefs usando la clave correcta que acabas de confirmar: `VouNMjljNalPNS/dBxC7Fw`.

Diagnóstico rápido (estado actual):
- En `index.html` la clave aún está mal escrita (`VouNMjij...`), por eso Ahrefs no la reconoce.
- El HTML SSR de bots (`pages-ssr`, `blog-ssr`, `news-ssr`) no incluye el script de Ahrefs; si algún crawler entra por prerender, tampoco lo verá.
- `supabase/functions/prerender-proxy/index.ts` aún contiene `ahrefsbot` y `semrushbot` en su lista de bots.

Plan de implementación:
1) Corregir clave en HTML principal
- Archivo: `index.html`
- Cambio: actualizar `data-key` del script Ahrefs a:
  - `VouNMjljNalPNS/dBxC7Fw`

2) Blindar el SSR para bots (consistencia total)
- Archivos:
  - `supabase/functions/pages-ssr/index.ts`
  - `supabase/functions/blog-ssr/index.ts`
  - `supabase/functions/news-ssr/index.ts`
- Cambio: añadir el mismo `<script src="https://analytics.ahrefs.com/analytics.js" data-key="VouNMjljNalPNS/dBxC7Fw" async></script>` dentro de `<head>`.
- Resultado: incluso si un bot recibe HTML pre-renderizado, Ahrefs verá su snippet.

3) Alinear el proxy de prerender con el Worker
- Archivo: `supabase/functions/prerender-proxy/index.ts`
- Cambio: eliminar `ahrefsbot` y `semrushbot` de `BOT_UA_PATTERNS`.
- Resultado: menos riesgo de enrutar verificadores de tracking por render alternativo.

4) Despliegue y validación (obligatorio)
- Publicar frontend (Lovable Publish).
- Desplegar edge functions modificadas.
- Confirmar despliegue del Worker de Cloudflare en `capittal.es/*`.
- Purga de caché en Cloudflare (mínimo `/` y `/contacto`, ideal “Purge Everything” una vez).
- Verificación final:
  - `view-source:https://capittal.es/` debe mostrar el script con `VouNMjlj...`
  - Repetir `Recheck installation` en Ahrefs.

Detalle técnico (archivos afectados):
- `index.html` (1 línea: corrección de clave)
- `supabase/functions/pages-ssr/index.ts` (inyección script Ahrefs en `<head>`)
- `supabase/functions/blog-ssr/index.ts` (inyección script Ahrefs en `<head>`)
- `supabase/functions/news-ssr/index.ts` (inyección script Ahrefs en `<head>`)
- `supabase/functions/prerender-proxy/index.ts` (quitar `ahrefsbot` y `semrushbot`)

Criterio de éxito:
- Ahrefs deja de mostrar “Script isn’t found” y pasa a estado verificado.
