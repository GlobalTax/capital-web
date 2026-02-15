

## Optimizar robots.txt y unificar sitemaps

### Contexto

El robots.txt actual es mas completo y correcto que la version simplificada sugerida. La version simple (`Disallow: /api/`) no cubre rutas internas que Google ya esta rastreando (`/operaciones/`, `/_vite/`, `/auth/`).

Sin embargo, hay dos problemas reales que resolver:

### Problema 1: Doble Sitemap en robots.txt

Actualmente robots.txt apunta a dos sitemaps diferentes:
- `Sitemap: https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/generate-sitemap` (dinamico, sin hreflang)
- `Sitemap: https://capittal.es/sitemap.xml` (estatico, con hreflang)

Google puede recibir datos contradictorios de ambos. Solucion: mantener solo uno.

### Problema 2: generate-sitemap sin hreflang

El sitemap dinamico no incluye etiquetas `xhtml:link hreflang`, lo que impide que Google asocie correctamente las variantes multilingues (ES/CA/EN) cuando usa esa fuente.

### Cambios propuestos

#### 1. Simplificar robots.txt (quitar lineas innecesarias, un solo sitemap)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin-login/
Disallow: /auth/
Disallow: /api/private/
Disallow: /operaciones/
Disallow: /_vite/
Disallow: /__vite/
Disallow: /ws/

Sitemap: https://capittal.es/sitemap.xml
```

Cambios respecto al actual:
- Eliminar reglas redundantes `Allow: /*.css$` etc. (no necesarias)
- Eliminar secciones de bots especificos (Googlebot, Bingbot, etc.) que solo repiten `Allow: /` ya cubierto por `User-agent: *`
- Mantener un unico Sitemap apuntando al estatico (el que tiene hreflang)
- Eliminar la referencia al sitemap de la Edge Function (evitar duplicidad)

#### 2. Anadir hreflang al generate-sitemap Edge Function

Para que el sitemap dinamico sea equivalente al estatico en calidad SEO, anadir las etiquetas hreflang. Esto incluye:

- Definir un mapa de rutas multilingues (ES -> CA, EN) como constante
- Para cada ruta que tenga variantes, generar las etiquetas `xhtml:link`
- Anadir el namespace `xmlns:xhtml` al XML
- Mantener las entradas de blog sin hreflang (solo existen en espanol)

Esto permite que en el futuro se pueda cambiar el Sitemap en robots.txt al dinamico sin perder informacion.

#### 3. Sincronizar sitemap.xml estatico

Verificar que el archivo estatico incluya las paginas legales (ya presentes) y que no haya discrepancias con la Edge Function.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `public/robots.txt` | Simplificar: un sitemap, eliminar reglas redundantes |
| `supabase/functions/generate-sitemap/index.ts` | Anadir hreflang a todas las rutas multilingues |

### Detalle tecnico: Estructura hreflang en generate-sitemap

Se creara un mapa de equivalencias multilingues:

```text
/venta-empresas -> ca: /venda-empreses, en: /sell-companies
/compra-empresas -> ca: /compra-empreses, en: /buy-companies
/equipo -> ca: /equip, en: /team
... (todas las rutas con variantes)
```

Para cada URL que tenga entrada en este mapa, el XML generado incluira las etiquetas `xhtml:link rel="alternate" hreflang="..."` correspondientes, identicas a las del sitemap.xml estatico.

