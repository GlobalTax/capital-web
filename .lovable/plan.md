

## Plan: Insertar 3 nuevos artículos de blog

### Resumen
Insertar los artículos 5, 6 y 7 en `blog_posts` con el contenido completo en HTML semántico, siguiendo el mismo formato que los 4 artículos existentes.

### Artículos

| # | Slug | Título | Categoría | Reading time | Featured |
|---|------|--------|-----------|-------------|----------|
| 5 | `private-equity-asesorias-eeuu-europa` | De EE.UU. a España: cómo el private equity ha transformado las asesorías en el mundo [2026] | M&A | 12 min | false |
| 6 | `15-mayores-deals-asesorias-mundo-2024-2026` | Los 15 mayores deals en asesorías del mundo (2024-2026) | M&A | 10 min | true |
| 7 | `lecciones-consolidacion-asesorias-europa-espana` | Lo que España puede aprender de la consolidación de asesorías en Europa [2026] | M&A | 11 min | false |

### Contenido HTML
- Todo el texto completo del usuario convertido a HTML semántico
- `<h2>` para secciones, `<p>` para párrafos, `<strong>` para datos clave
- CTAs internos con `<a href="/lp/calculadora-asesorias">`
- FAQs en `faq_data` JSONB (3-4 preguntas por artículo)
- Meta titles y descriptions optimizados para SEO
- `author_name`: "Samuel Navarro"

### Implementación
1. Usar herramienta de insert para insertar los 3 artículos con contenido HTML completo
2. Desactivar/reactivar el trigger `trigger_google_indexing` vía migración si es necesario
3. Cada artículo incluirá: content, excerpt, meta_title, meta_description, faq_data, tags

### Archivos modificados
Ninguno — inserción directa en base de datos.

