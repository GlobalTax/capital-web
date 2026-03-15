

## Plan: Publicar artículo EBITDA con SEO, FAQPage schema y optimización GEO

### Resumen

Publicar el artículo sobre EBITDA en la base de datos Supabase (`blog_posts`) con todo el contenido formateado en HTML, y modificar el código para que los posts del blog puedan inyectar schemas FAQPage dinámicamente (actualmente solo se inyectan Article + BreadcrumbList).

---

### 1. Insertar el artículo en Supabase

Ejecutar un INSERT en la tabla `blog_posts` con:

| Campo | Valor |
|-------|-------|
| `title` | Qué es el EBITDA: definición, fórmula y ejemplo práctico [2026] |
| `slug` | `que-es-ebitda` |
| `meta_title` | Qué es el EBITDA: definición, fórmula y ejemplo práctico [2026] |
| `meta_description` | El EBITDA es el beneficio antes de intereses, impuestos, depreciaciones y amortizaciones. Descubre cómo se calcula, para qué sirve en M&A y qué múltiplos aplica tu sector. Con ejemplo, tabla comparativa y calculadora. |
| `excerpt` | El EBITDA es el beneficio bruto de explotación. Guía completa con fórmula, ejemplo práctico, márgenes por sector y múltiplos EV/EBITDA en España. |
| `author_name` | Samuel Navarro |
| `category` | Valoración |
| `tags` | `["ebitda", "ebitda que es", "ebitda formula", "ebitda ajustado", "multiplo ebitda", "margen ebitda", "valoracion empresas", "m&a"]` |
| `reading_time` | 12 |
| `is_published` | true |
| `is_featured` | false |
| `featured_image_url` | (se dejará vacío o se usará un placeholder hasta que se suba la infografía) |
| `content` | HTML completo del artículo (ver sección 3) |

URL final: `https://capittal.es/recursos/blog/que-es-ebitda`

---

### 2. Añadir soporte FAQPage schema al componente BlogPost

**Archivo: `src/pages/blog/BlogPost.tsx`**

Actualmente el `structuredData` solo incluye `getArticleSchema` + `getBreadcrumbSchema`. Necesitamos añadir condicionalmente el `getFAQSchema` cuando el contenido del post tenga preguntas FAQ.

Estrategia: Extraer las FAQs del contenido HTML del post (buscar un patrón de sección FAQ) o, más robusto, definir las FAQs como datos estructurados dentro del campo `content` usando un formato parseable (por ejemplo, un bloque `<!-- FAQ_JSON [...] -->` embebido en el content).

**Enfoque elegido**: Incluir el FAQPage schema hardcodeado en el contenido HTML como un `<script type="application/ld+json">` dentro del campo `content` del post. Esto es lo más simple y funciona tanto en el renderizado React (`BlogProseContent` lo pasará como HTML) como en `blog-ssr` (que ya inyecta `post.content` directamente). No requiere cambios en el componente.

**Alternativa más limpia** (recomendada): Añadir un campo opcional `faq_data` (jsonb) a la tabla `blog_posts` y modificar `BlogPost.tsx` y `blog-ssr` para inyectar el FAQPage schema cuando ese campo exista.

---

### 3. Contenido HTML del artículo

El campo `content` contendrá el artículo completo formateado como HTML semántico, incluyendo:

- Encabezados H2/H3 para cada sección
- Tablas HTML con `<table>`, `<thead>`, `<tbody>` para los datos comparativos (márgenes por sector, múltiplos, ejemplo de cálculo, ajustes EBITDA)
- Blockquotes `<blockquote>` para las citas de Samuel Navarro
- Destacados con clases CSS para las estadísticas (87%, 5.4x)
- Links internos: `/recursos/blog/que-es-private-equity`, `/recursos/blog/fusiones-y-adquisiciones`, `/recursos/blog/que-es-due-diligence`, `/servicios/valoracion-empresas`, `/servicios/venta-de-empresas`
- Sección FAQ con estructura semántica (H3 por pregunta, párrafos por respuesta)
- CTA final con enlace a `/#contacto`
- Nota de "Última actualización: marzo 2026"
- FAQPage JSON-LD embebido como `<script>` dentro del content

---

### 4. Actualizar blog-ssr para FAQPage schema

**Archivo: `supabase/functions/blog-ssr/index.ts`**

Si el `content` del post contiene el `<script type="application/ld+json">` con FAQPage, `blog-ssr` ya lo renderiza dentro de `post.content` en el `<body>`. Sin embargo, los schemas JSON-LD deberían estar en el `<head>`, no en el `<body>`.

**Mejor enfoque**: Parsear el content en `blog-ssr` para extraer cualquier `<script type="application/ld+json">` y moverlo al `<head>`. O usar el campo `faq_data` si se implementa.

---

### Decisión requerida

Hay dos caminos para el FAQPage schema:

**Opción A — Rápida**: Embeber el FAQPage JSON-LD directamente en el HTML del `content`. Funciona inmediatamente sin cambios de código ni de base de datos. El schema quedará en el `<body>` (válido según Google, pero no ideal).

**Opción B — Limpia**: Añadir un campo `faq_data jsonb` a la tabla `blog_posts`, modificar `BlogPost.tsx` para inyectar `getFAQSchema(post.faq_data)` cuando exista, y modificar `blog-ssr` para generar el schema en el `<head>`. Más trabajo, pero escalable para futuros posts con FAQ.

**Recomiendo la Opción B** — es poco trabajo extra (un ALTER TABLE, ~5 líneas en BlogPost.tsx, ~10 líneas en blog-ssr) y queda correctamente implementado para todos los posts futuros.

---

### Resumen de cambios

| Tarea | Archivos |
|-------|----------|
| ALTER TABLE blog_posts ADD COLUMN faq_data jsonb | Supabase migration |
| Insertar artículo EBITDA con contenido HTML + faq_data | Supabase INSERT |
| Añadir FAQPage schema condicional | `src/pages/blog/BlogPost.tsx` |
| Añadir FAQPage schema al SSR | `supabase/functions/blog-ssr/index.ts` |
| Deploy blog-ssr actualizado | Edge Function deploy |

