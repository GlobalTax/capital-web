

## Plan: Insertar 4 artículos de blog sobre consolidación de asesorías

### Resumen
Ejecutar un script que inserte los 4 artículos en la tabla `blog_posts` de Supabase usando `supabase--read_query` o un migration/edge function approach. El contenido se formateará como HTML rico con estructura GEO (estadísticas, citas, tablas, enlaces internos) y se incluirán FAQs en `faq_data`.

### Artículos a crear

| # | Slug | Categoría | Tags | Reading time |
|---|------|-----------|------|-------------|
| 1 | `consolidacion-asesorias-espana-2026` | M&A | consolidación, asesorías, private equity, España | 8 min |
| 2 | `cuanto-vale-asesoria-multiplos-2026` | Valoración | valoración, múltiplos, EBITDA, asesorías | 7 min |
| 3 | `vender-asesoria-guia-maximizar-precio` | M&A | venta, asesorías, due diligence, preparación | 9 min |
| 4 | `crecer-comprando-plataforma-asesorias` | M&A | buy-and-build, plataforma, adquisiciones, asesorías | 8 min |

### Contenido HTML
Cada artículo se formateará con:
- `<h2>` para secciones principales, `<h3>` para subsecciones
- `<p>` con datos verificables y estadísticas (INE, TTR, fuentes reales)
- `<strong>` para énfasis en datos clave
- `<blockquote>` para citas/destacados
- `<ul>`/`<ol>` para listas
- Enlaces internos `<a href="/lp/calculadora-asesorias">` al CTA de la calculadora
- Tablas HTML donde corresponda (compradores, múltiplos)

### FAQ data (JSON)
Cada artículo incluirá 3-5 preguntas FAQ relevantes en el campo `faq_data` para schema FAQPage.

### SEO
- `meta_title`: optimizado con "[2026]" y keyword principal
- `meta_description`: 155 chars max con CTA implícito
- `author_name`: "Samuel Navarro"
- `is_published`: true
- `is_featured`: artículo 1 como featured

### Implementación
1. Crear un script que use `psql` o la herramienta `supabase--read_query` para insertar los 4 posts
2. Dado que solo tenemos acceso INSERT (no UPDATE), los datos deben ser correctos a la primera
3. El contenido completo del usuario se convertirá a HTML semántico respetando la estructura proporcionada

### Archivos modificados
Ninguno — es una inserción directa en base de datos.

