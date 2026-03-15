

## Plan: Publicar 4 artículos SEO+GEO en blog_posts

El artículo de EBITDA (`que-es-ebitda`) ya está publicado. Los 5 documentos subidos incluyen ese + 4 nuevos artículos que necesitan insertarse en Supabase.

### Artículos a publicar

| # | Slug | Title | Category | Reading Time | FAQs |
|---|------|-------|----------|-------------|------|
| 1 | `fusiones-y-adquisiciones` | Fusiones y adquisiciones (M&A): qué son, tipos y proceso completo [2026] | M&A | 14 | 4 preguntas |
| 2 | `que-es-due-diligence` | Qué es una Due Diligence: proceso, tipos y checklist [2026] | Due Diligence | 12 | 4 preguntas |
| 3 | `que-es-private-equity` | Qué es Private Equity: cómo funcionan los fondos de capital privado [2026] | Private Equity | 12 | 4 preguntas |
| 4 | `que-es-un-nda` | Qué es un NDA (acuerdo de confidencialidad): guía completa [2026] | Legal | 11 | 4 preguntas |

### Nota sobre slugs duplicados

Ya existe un post con slug `que-es-due-diligence-guia-completa-ma`. El nuevo artículo usa slug `que-es-due-diligence` (más limpio y SEO-optimizado). Ambos pueden coexistir, pero recomiendo despublicar el antiguo para evitar canibalización. Lo confirmo contigo antes de actuar.

### Para cada artículo se hará

1. **INSERT en `blog_posts`** con todos los campos SEO (meta_title, meta_description, tags, excerpt, author_name, etc.)
2. **Contenido HTML** completo con:
   - Tablas `<table>` para datos comparativos
   - `<blockquote>` para citas de Samuel Navarro
   - Destacados CSS para estadísticas (87%, 94%, 73%, etc.)
   - Links internos entre los 5 artículos del cluster + páginas de servicios
   - Sección FAQ semántica con H3 por pregunta
   - CTA final con enlace a `/#contacto`
   - "Última actualización: marzo 2026"
3. **`faq_data` JSONB** con las preguntas/respuestas estructuradas para el FAQPage schema (mismo patrón usado en el artículo EBITDA)

### Infraestructura

No se necesitan cambios de código ni de esquema — el campo `faq_data` ya existe en `blog_posts` y `BlogPost.tsx` + `blog-ssr` ya inyectan el FAQPage schema condicionalmente. Solo son 4 INSERTs de datos.

### Deploy

No requiere deploy de edge functions — `blog-ssr` ya soporta `faq_data`. Solo insertar los 4 registros.

