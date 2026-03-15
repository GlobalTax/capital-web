

# Plan: Publicar artículo "Cómo vender mi empresa" en el blog

## Acción única

Crear una migración SQL que inserte el artículo completo en `blog_posts` con:

- **slug**: `vender-mi-empresa`
- **meta_title**: `Cómo vender mi empresa: guía completa paso a paso [2026]`
- **meta_description**: La proporcionada (guía práctica...)
- **category**: `M&A`
- **tags**: cluster completo de keywords secundarias
- **reading_time**: ~15 min
- **is_published**: true, **is_featured**: true
- **author_name**: `Samuel Navarro`
- **faq_data**: JSONB con las 4 preguntas del FAQ
- **content**: HTML completo con:
  - Fecha visible "Última actualización: marzo 2026"
  - Estadísticas destacadas en `<div class="bg-muted/50 border-l-4 border-primary">` (2.800+ operaciones, 25-40% NDAs, etc.)
  - Citas de Samuel Navarro en `<blockquote>`
  - Tablas HTML (costes de venta) con formato zebra-striped
  - Internal links: `/recursos/blog/valoracion-de-empresas`, `/recursos/blog/que-es-due-diligence`, `/recursos/blog/que-es-un-nda`, `/recursos/blog/que-es-ebitda`, `/recursos/blog/fusiones-y-adquisiciones`
  - CTA final enlazando a `/#contacto` y `/servicios/venta-de-empresas`
  - Sección de fuentes y referencias
- Trigger `trigger_google_indexing` deshabilitado/rehabilitado durante el INSERT

El artículo será accesible en `/recursos/blog/vender-mi-empresa`. Los schemas Article, FAQ y Breadcrumb se generan automáticamente por `BlogPost.tsx` y `blog-ssr`.

### Archivo
- **Crear** `supabase/migrations/[timestamp].sql` — INSERT con todo el contenido

