

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
