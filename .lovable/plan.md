

## Plan: Publicar artículo "Holding empresarial" + Fix build error

### 1. Fix build error (previo)

El error de build es en `supabase/functions/generate-exit-readiness-report/index.ts` línea 2: `import { Resend } from 'npm:resend@2.0.0'` no se resuelve. Cambiar a import via `esm.sh`:

```ts
import { Resend } from 'https://esm.sh/resend@2.0.0';
```

### 2. Migración SQL: insertar el artículo

Crear una migración SQL que:

1. Deshabilite `trigger_google_indexing`
2. Inserte el post en `blog_posts` con:
   - **slug**: `holding-empresarial`
   - **title**: `Holding empresarial: qué es, tipos, ventajas y cómo funciona [2026]`
   - **meta_title/meta_description**: según instrucciones
   - **author_name**: `Samuel Navarro`
   - **author_avatar_url**: URL estándar de Samuel
   - **category**: `Fiscal`
   - **tags**: `{holding empresarial, holding familiar, holding ventajas, holding fiscal, LIS, artículo 21, FEAC, estructura societaria}`
   - **reading_time**: `18`
   - **is_published**: `true`, **is_featured**: `true`
   - **published_at**: `NOW()`
   - **faq_data**: JSON con las 4 preguntas FAQ del artículo
   - **content**: HTML completo del artículo con:
     - Estructura semántica (h2, h3, tablas, blockquotes, listas)
     - Estadísticas en bloques destacados (estilo consistente con otros posts)
     - Cita de Samuel Navarro en blockquote
     - Enlaces internos a: `/blog/regimen-feac`, `/blog/articulo-21-lis-exencion-participaciones`, `/blog/sociedad-holding-como-crear`, `/blog/valoracion-de-empresas`, `/blog/vender-mi-empresa`, `/servicios/reestructuracion-societaria`
     - CTA final con enlace a servicios
     - Tablas HTML para los comparativos (tipos de holding, esquema de funcionamiento, requisitos legales)
     - Sección FAQ con acordeón visual
     - Sección de fuentes y referencias
3. Rehabilite el trigger

### Archivos a modificar
- `supabase/functions/generate-exit-readiness-report/index.ts` — fix import Resend
- Nueva migración SQL — insertar el artículo completo

