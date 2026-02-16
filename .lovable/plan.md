

## Automatizar el sitemap dinamicamente

### Situacion actual
- `public/sitemap.xml`: Archivo estatico de ~780 lineas con fechas hardcodeadas. Es lo que leen los buscadores.
- Edge Function `generate-sitemap`: Ya genera el sitemap completo dinamicamente (rutas estaticas + posts del blog desde la base de datos). Funciona correctamente.
- El problema: los buscadores leen el archivo estatico, no la Edge Function.

### Solucion

**1. Actualizar `robots.txt`**
Cambiar la directiva `Sitemap` para que apunte directamente a la Edge Function de Supabase en lugar del archivo estatico:

```
Sitemap: https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/generate-sitemap
```

Google y otros buscadores aceptan URLs de sitemap en dominios distintos al principal. Esto hace que cada vez que un bot solicite el sitemap, reciba la version dinamica con los posts del blog actualizados automaticamente.

**2. Simplificar `public/sitemap.xml`**
Reemplazar las ~780 lineas del archivo estatico por un XML minimo tipo "sitemap index" que redirige a la Edge Function. Esto sirve como fallback por si alguien accede directamente a `/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/generate-sitemap</loc>
    <lastmod>2026-02-16</lastmod>
  </sitemap>
</sitemapindex>
```

**3. Sin cambios en la Edge Function**
La funcion `generate-sitemap` ya esta completa: incluye todas las rutas estaticas con hreflang multilingue y consulta `blog_posts` de Supabase para anadir posts publicados dinamicamente.

### Resultado
- Cada vez que Google rastree el sitemap, obtendra la version dinamica actualizada
- Los nuevos posts del blog aparecen automaticamente sin intervencion manual
- Las fechas `lastmod` se generan dinamicamente (fecha del dia para rutas estaticas, `updated_at` para posts)
- No se requiere Cloudflare Worker para esta funcionalidad

### Seccion tecnica
- Archivos modificados: `public/robots.txt`, `public/sitemap.xml`
- Sin nuevas dependencias
- La Edge Function usa `SUPABASE_URL` y `SUPABASE_ANON_KEY` (variables de entorno por defecto de Supabase, ya configuradas)

