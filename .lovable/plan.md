

## Revisión del snippet de Prerender.io

### Problema principal: No usas Prerender.io

Tu proyecto **no usa Prerender.io**. Tienes tu propia infraestructura SSR con edge functions (`prerender-proxy`, `blog-ssr`, `news-ssr`, `pages-ssr`). El endpoint `api.prerender.io/recache` es de un servicio de terceros que no tienes contratado, así que esa llamada no haría nada.

### Bug real encontrado en `prerender-proxy`

Al revisar tu edge function `prerender-proxy/index.ts` (línea 78), hay un bug importante:

```
if (path.startsWith("/blog/") && path.length > 6)
```

Esto busca `/blog/slug`, pero la ruta real de tus posts es **`/recursos/blog/slug`**. Los bots que pidan `/recursos/blog/como-se-valora-una-empresa` **no entrarán en el branch de blog-ssr** — caerán en `pages-ssr` como página genérica.

### Plan de corrección

**Fichero: `supabase/functions/prerender-proxy/index.ts`**

Cambiar la detección de rutas de blog (línea 78-82):
- De: `path.startsWith("/blog/")` con `path.replace("/blog/", "")`
- A: `path.match(/^\/recursos\/blog\/(.+)$/)` extrayendo el slug del grupo de captura

Esto alinea el proxy con las rutas reales (`/recursos/blog/{slug}`) igual que ya hace correctamente para noticias (`/recursos/noticias/{slug}`).

### Sobre invalidación de cache

Tu SSR actual usa `Cache-Control: max-age=3600` (1 hora). Cuando publicas un post nuevo, los bots verán la versión actualizada tras expirar la caché. Si quisieras invalidación inmediata, se podría añadir una llamada a la edge function de `generate-sitemap` tras publicar, pero no es crítico dado el TTL de 1 hora.

