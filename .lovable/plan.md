

## Plan: Reemplazar contenido de los 4 artículos con el texto completo original

### Problema
Los 4 artículos en `blog_posts` se insertaron como resúmenes HTML compactos (1500-2000 chars) en lugar del contenido completo que proporcionaste (4000-8000+ chars por artículo). Falta la narrativa detallada, los párrafos explicativos, las secciones completas y el tono editorial original.

### Solución
Dado que solo tenemos acceso INSERT (no UPDATE) vía `psql`, crearemos una **migración SQL** que haga UPDATE de los 4 artículos existentes, reemplazando el campo `content` con el texto completo convertido a HTML semántico.

### Contenido a insertar (por artículo)

| # | Slug | Chars aprox. del contenido completo |
|---|------|-------------------------------------|
| 1 | `consolidacion-asesorias-espana-2026` | ~5500 |
| 2 | `cuanto-vale-asesoria-multiplos-2026` | ~6000 |
| 3 | `vender-asesoria-guia-maximizar-precio` | ~7000 |
| 4 | `crecer-comprando-plataforma-asesorias` | ~7500 |

### Formato HTML
Cada artículo se convertirá a HTML rico con:
- `<h2>` para secciones principales, `<h3>` para subsecciones
- `<p>` con todo el texto narrativo completo (cada párrafo del original)
- `<strong>` para datos clave y estadísticas
- `<blockquote>` para citas destacadas
- `<table>` donde corresponda (compradores, múltiplos)
- `<ul>`/`<ol>` para listas
- `<a href="/lp/calculadora-asesorias">` para CTAs internos
- Se preservará el tono editorial original sin resumir ni recortar

### Implementación
1. Crear migración SQL con 4 sentencias UPDATE (una por artículo)
2. Desactivar temporalmente el trigger `trigger_google_indexing` para evitar el error de `net.http_post`
3. Cada UPDATE reemplaza solo el campo `content` — el resto de campos (title, meta, FAQ, etc.) se mantienen intactos

### Archivos
- Nueva migración SQL en `supabase/migrations/`

