

## Sitemap: 2 bugs encontrados

### Bug 1: URLs de blog incorrectas
Tanto la edge function `generate-sitemap` como el cliente `generateSitemap.ts` generan URLs de blog como `/blog/{slug}` pero la ruta real es `/recursos/blog/{slug}` (hay un redirect 301 de `/blog` a `/recursos/blog` en el router).

### Bug 2: Noticias ausentes del sitemap
Las ~381+ noticias publicadas de `news_articles` no aparecen en ninguno de los dos generadores de sitemap. Solo se incluyen blog posts.

### Plan de cambios

**Fichero 1: `supabase/functions/generate-sitemap/index.ts`**
- Corregir la ruta de blog posts de `/blog/{slug}` a `/recursos/blog/{slug}`
- Añadir query a `news_articles` (filtrado por `is_published=true`, `is_deleted=false`) y generar entradas `<url>` con ruta `/recursos/noticias/{slug}`

**Fichero 2: `src/utils/seo/generateSitemap.ts`**
- Misma corrección: `/blog/{slug}` → `/recursos/blog/{slug}`
- Añadir query a `news_articles` y generar entradas correspondientes

**Fichero 3: `src/utils/seo/blogSitemap.ts`**
- Corregir ruta de `/blog/{slug}` a `/recursos/blog/{slug}`

Después del deploy, redesplegar la edge function `generate-sitemap`.

