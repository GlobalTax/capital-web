

## Plan: Insertar artículo "¿Qué es el EBITDA?" en blog_posts

He revisado el contenido y la estructura de la tabla `blog_posts`. El slug no existe aún, así que se puede insertar directamente.

### Revisión del contenido

El artículo es sólido. Observaciones menores:

- **meta_title** (92 caracteres) excede los 60 char recomendados para Google. Propongo recortar a: `¿Qué es el EBITDA y cómo se calcula? | Capittal` (49 char).
- **meta_description** (164 caracteres) excede ligeramente los 155 char. Propongo recortar a: `El EBITDA mide la rentabilidad operativa antes de intereses, impuestos y amortizaciones. Fórmula, ejemplos prácticos y múltiplos por sector en España.` (152 char).
- **category**: La tabla usa valores como "Valoración" (con tilde y mayúscula). Confirmo que `Valoración` es categoría válida del array `VALID_CATEGORIES`.
- **reading_time**: ~2.200 palabras ÷ 200 = **11 minutos**.
- **tags**: Se mapean como array: `{EBITDA, valoración, "M&A", múltiplos, contabilidad}`.

### Acción

1. **Insertar el post** en `blog_posts` con el contenido formateado en HTML semántico (sin `<h1>`, usando `<h2>`, `<h3>`, `<p>`, `<table>`, `<ul>`, `<strong>`, `<blockquote>`).
2. Estado: `is_published = true`, `published_at = now()`.
3. `is_featured = false` (salvo que indiques lo contrario).

### Detalle de campos

| Campo | Valor |
|---|---|
| title | ¿Qué es el EBITDA y cómo se calcula? Guía completa con ejemplos |
| slug | que-es-el-ebitda-como-se-calcula-guia-completa |
| excerpt | El EBITDA mide la rentabilidad operativa de una empresa antes de intereses, impuestos y amortizaciones. Guía con fórmula, ejemplos y múltiplos por sector. |
| category | Valoración |
| tags | EBITDA, valoración, M&A, múltiplos, contabilidad |
| reading_time | 11 |
| meta_title | ¿Qué es el EBITDA y cómo se calcula? \| Capittal |
| meta_description | El EBITDA mide la rentabilidad operativa antes de intereses, impuestos y amortizaciones. Fórmula, ejemplos prácticos y múltiplos por sector en España. |
| content | HTML semántico completo del artículo (tablas, listas, blockquotes para definiciones) |

