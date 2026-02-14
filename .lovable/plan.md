

## Plan: Edge Function `generate-sitemap` para sitemap.xml dinamico

### Que se va a crear

Una edge function `generate-sitemap` que devuelve el sitemap.xml completo (rutas estaticas + articulos del blog) directamente desde la base de datos, de forma que cada nuevo articulo publicado se incluya automaticamente sin tocar codigo.

### Archivo nuevo

**`supabase/functions/generate-sitemap/index.ts`**

- Endpoint publico (sin JWT) que responde a GET con `Content-Type: application/xml`
- Combina las rutas estaticas (copiadas de `generateSitemap.ts`) con los blog posts publicados consultados via Supabase
- Query: `SELECT slug, published_at, updated_at FROM blog_posts WHERE is_published = true ORDER BY published_at DESC`
- Cada articulo genera una entrada `<url>` con `loc=https://capittal.es/blog/{slug}`, `lastmod`, `changefreq=monthly`, `priority=0.7`
- Cache header: `Cache-Control: public, max-age=3600` (1 hora) para no sobrecargar la DB
- CORS headers estandar incluidos
- Manejo de errores: si falla la query de blog, devuelve el sitemap solo con rutas estaticas (degradacion elegante)

### Configuracion

**`supabase/config.toml`** — anadir:
```toml
[functions.generate-sitemap]
verify_jwt = false
```

### Como se usara

El sitemap estara disponible en:
```
https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/generate-sitemap
```

Para que Google lo detecte, se podra:
1. Configurar en Google Search Console apuntando a esa URL
2. O referenciarlo desde `robots.txt`

### Sin cambios en archivos existentes

El `public/sitemap.xml` estatico y las utilidades en `src/utils/seo/` se mantienen intactos como fallback. La edge function es independiente.

