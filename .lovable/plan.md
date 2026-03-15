

## Plan: Publicar artículo "Qué es un earn-out en M&A"

### Acción principal
Crear una migración SQL que inserte el artículo completo en la tabla `blog_posts`, incluyendo `faq_data` JSONB para el schema FAQPage automático.

### Detalles

**1. Migración SQL — INSERT en `blog_posts`**
- `slug`: `que-es-earn-out`
- `title`: Qué es un earn-out en M&A: cómo funciona, cláusulas y ejemplos [2026]
- `meta_title`: Qué es un earn-out en M&A: cómo funciona, cláusulas y ejemplos [2026]
- `meta_description`: El earn-out es un pago variable en la compraventa de empresas vinculado a resultados futuros. Descubre cómo funciona, qué cláusulas incluir, riesgos para comprador y vendedor, y ejemplos prácticos en el mid-market español.
- `author_name`: Samuel Navarro
- `author_avatar_url`: (avatar estándar del memory)
- `category`: M&A
- `tags`: earn out, earn out que es, earn out m&a, clausula earn out, pago diferido venta empresa
- `reading_time`: 12
- `is_published`: true
- `is_featured`: false
- `featured_image_url`: imagen genérica del blog (o placeholder)
- `content`: HTML completo del artículo con:
  - Tablas HTML (`<table>`) para las comparativas
  - Citas en `<blockquote>` con atribución
  - Estadísticas destacadas con formato visual
  - **Enlaces internos corregidos**: `/blog/valoracion-de-empresas` → `/recursos/blog/como-se-valora-una-empresa-claves-para-entenderlo-incluye-ejemplo-practico` (el slug real)
  - Los otros 4 enlaces: `/recursos/blog/vender-mi-empresa`, `/recursos/blog/que-es-ebitda`, `/recursos/blog/fusiones-y-adquisiciones`, `/recursos/blog/que-es-due-diligence`
  - CTA final con enlace a `/contacto`
  - Sección de fuentes y referencias
  - Fecha "Última actualización" visible
- `faq_data`: JSONB con las 4 preguntas del FAQ (esto activa automáticamente el FAQPage schema tanto en el componente React como en blog-ssr)

**2. No se requieren cambios en código frontend** — blog-ssr y BlogPost.tsx ya soportan `faq_data`, Article schema, y BreadcrumbList schema dinámicamente.

### Nota sobre enlace incorrecto
Las instrucciones indican enlazar a `/blog/valoracion-de-empresas`, pero ese slug no existe. Se usará el slug real: `como-se-valora-una-empresa-claves-para-entenderlo-incluye-ejemplo-practico`.

### Archivos
- **Crear** migración SQL con INSERT completo del artículo

