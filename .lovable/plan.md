
## Edge Function `blog-ssr`: HTML pre-renderizado para articulos del blog

### El problema

Tu web es una SPA pura (React + Vite). Cuando un crawler o red social accede a `capittal.es/blog/mi-articulo`, solo ve:
```html
<div id="root"></div>
```
Cero contenido. Google puede renderizar JS (con retraso), pero Bing, LinkedIn, Twitter, Facebook y herramientas SEO no ven nada.

### La solucion

Crear una edge function `blog-ssr` que devuelva una pagina HTML completa con:
- Meta tags Open Graph y Twitter Card dinamicos (titulo, descripcion, imagen)
- El contenido real del articulo en HTML semantico
- Schema.org structured data (Article)
- Un redirect automatico a la version SPA para usuarios normales

### Como funciona

```text
Crawler/Red social                    Usuario normal
       |                                    |
       v                                    v
  Edge Function                     capittal.es/blog/slug
  blog-ssr?slug=X                   (SPA con React)
       |
       v
  HTML completo con:
  - og:title, og:description, og:image
  - Contenido del articulo
  - Schema.org JSON-LD
  - <meta http-equiv="refresh"> hacia la URL real
```

### Archivo nuevo

**`supabase/functions/blog-ssr/index.ts`**

- Recibe `?slug=mi-articulo` como query parameter
- Consulta `blog_posts` en Supabase para obtener titulo, excerpt, contenido, imagen, autor, fecha
- Genera HTML completo con:
  - `<title>` y meta description
  - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
  - Twitter Card tags
  - Schema.org `Article` structured data en JSON-LD
  - El contenido del articulo en HTML semantico (ya viene en HTML de la DB)
  - CSS basico inline para legibilidad
  - Link canonico apuntando a `https://capittal.es/blog/{slug}`
  - Meta refresh opcional hacia la URL SPA
- Sin JWT (publico para crawlers)
- Cache: `public, max-age=3600` (1 hora)
- Degradacion elegante: si el slug no existe, devuelve 404 con HTML basico

### Configuracion

**`supabase/config.toml`** - anadir:
```toml
[functions.blog-ssr]
verify_jwt = false
```

### Como se usara

La URL de cada articulo pre-renderizado sera:
```
https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/blog-ssr?slug=nombre-del-articulo
```

**Para maximizar el impacto SEO:**

1. **Sitemap**: Actualizar la edge function `generate-sitemap` para que las URLs del blog apunten a la version SSR (o incluir ambas)
2. **Redes sociales**: Al compartir articulos, usar la URL de la edge function para que Facebook, LinkedIn y Twitter lean los meta tags correctamente
3. **Google Search Console**: Se puede enviar el sitemap con las URLs SSR como alternativa

### Sin cambios en la SPA

La aplicacion React sigue funcionando exactamente igual. La edge function es un complemento independiente que solo sirve HTML para crawlers y previsualizaciones de redes sociales.

### Seccion tecnica

**Query a la base de datos:**
```sql
SELECT title, slug, excerpt, content, meta_title, meta_description,
       featured_image_url, author_name, published_at, updated_at, tags, category
FROM blog_posts
WHERE slug = $1 AND is_published = true
LIMIT 1
```

**Estructura del HTML generado:**
- DOCTYPE html con lang="es"
- Head: charset, viewport, title, meta description, canonical, OG tags, Twitter tags, JSON-LD
- Body: header con logo, h1 con titulo, metadata (autor, fecha, categoria), imagen destacada, contenido del articulo, footer con link a la version completa
- CSS inline minimo para legibilidad basica

**Sanitizacion:**
- El contenido HTML del articulo se sirve tal cual (ya esta sanitizado al guardarse en la DB)
- Los meta tags escapan caracteres especiales para prevenir inyeccion
- El JSON-LD usa la funcion `safeJsonLd` existente (escape de `<` como `\u003c`)
