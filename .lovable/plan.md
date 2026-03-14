

## Plan: Simplificar el sitemap a las categorías solicitadas

### Cambios necesarios

Se actualizarán **3 ficheros** para que el sitemap solo incluya las URLs que has especificado, eliminando noticias, landing pages extra, rutas multilingües, legal, y demás.

### URLs que quedarán en el sitemap

**Estáticas (18 URLs):**
- `/`
- `/servicios/venta-empresas`, `/servicios/compra-empresas`, `/servicios/valoraciones`, `/servicios/due-diligence`, `/servicios/reestructuraciones`, `/servicios/planificacion-fiscal`
- `/sectores/seguridad`, `/sectores/tecnologia`, `/sectores/industrial`, `/sectores/healthcare`, `/sectores/energia`, `/sectores/construccion`, `/sectores/logistica`, `/sectores/medio-ambiente`, `/sectores/retail`, `/sectores/alimentacion`
- `/equipo`, `/contacto`, `/recursos/blog`, `/lp/calculadora`, `/por-que-elegirnos`, `/casos-exito`, `/search-funds`, `/programa-colaboradores`

**Dinámicas:** `/recursos/blog/{slug}` para cada post con `is_published = true`

### Lo que se elimina
- Todas las `/recursos/noticias/*` (listado + artículos dinámicos)
- Todas las `/lp/*` excepto `/lp/calculadora`
- `/legal/*`, `/politica-privacidad`, `/terminos-uso`, `/cookies`
- Rutas multilingües (EN, CA, serveis, services, sectors)
- `/de-looper-a-capittal`, `/venta-empresas`, `/compra-empresas` (raíz), `/recursos/case-studies`
- Todo el bloque de `HREFLANG_MAP` y `xhtml:link` (simplificación)

### Ficheros a modificar

**1. `supabase/functions/generate-sitemap/index.ts`**
- Reemplazar `staticRoutes` con solo las 18+ URLs listadas arriba
- Eliminar el bloque `HREFLANG_MAP`, `PATH_TO_GROUP`, y la función `buildUrlEntry` con hreflang
- Eliminar la query a `news_articles` y la variable `newsEntries`
- Simplificar la generación XML (sin namespace `xhtml`)
- Nota: `/sectores/retail-consumer` se cambia a `/sectores/retail`

**2. `src/utils/seo/generateSitemap.ts`**
- Mismos cambios: reducir `staticRoutes`, eliminar hreflang, eliminar news query
- Cambiar `/sectores/retail-consumer` → `/sectores/retail`

**3. `src/utils/seo/blogSitemap.ts`**
- Sin cambios funcionales (ya solo genera blog posts con ruta correcta)

Después se redesplegará la edge function y se verificará con curl.

