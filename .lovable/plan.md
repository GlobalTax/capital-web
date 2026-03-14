

## Problema: "Non-canonical page in sitemap" — 90 URLs afectadas

### Diagnóstico

Ahrefs Site Audit detecta que **todas las páginas tienen canonical apuntando a `https://capittal.es/`** (la home) en lugar de a su propia URL.

**Causa raíz**: Cuando eliminamos `ahrefsbot` del pre-renderizado (para la verificación del script de analytics), el crawler de Ahrefs empezó a recibir el `index.html` estático en bruto. Este archivo tiene una etiqueta hardcoded:

```html
<link rel="canonical" href="https://capittal.es/" />
```

El script síncrono que actualiza el canonical (línea 180-183 de `index.html`) requiere ejecución de JavaScript, que Ahrefs no ejecuta. Por tanto, todas las páginas se ven con canonical = homepage.

**La buena noticia**: Las funciones SSR (`pages-ssr`, `blog-ssr`, `news-ssr`) ya generan el canonical correcto por página **Y** ya incluyen el script de Ahrefs Analytics (lo inyectamos en el paso anterior). No hay conflicto.

### Plan de implementación

**Re-añadir `ahrefsbot` al pipeline de pre-renderizado** en dos archivos:

1. **`cloudflare/worker-bot-prerender.js`** — Añadir `'ahrefsbot'` al array `BOT_UA_PATTERNS` (línea ~18).

2. **`supabase/functions/prerender-proxy/index.ts`** — Añadir `'ahrefsbot'` al array `BOT_UA_PATTERNS`.

Esto hará que el crawler de Ahrefs reciba el HTML pre-renderizado de las edge functions SSR, que incluyen:
- ✓ Canonical correcto por página (ej: `https://capittal.es/sectores/tecnologia`)
- ✓ Script de Ahrefs Analytics (inyectado en el paso anterior)
- ✓ Meta tags SEO completos
- ✓ JSON-LD estructurado

### Por qué no rompe la verificación de Ahrefs

La razón original para excluir `ahrefsbot` era que el HTML pre-renderizado no contenía el script de analytics. Pero **ya lo inyectamos** en `pages-ssr`, `blog-ssr` y `news-ssr`. Ahora el bot verá tanto el script como los canonicals correctos.

### Post-implementación

- Redesplegar la edge function `prerender-proxy`.
- Actualizar el Worker de Cloudflare con el nuevo archivo.
- Purgar caché en Cloudflare.
- En Ahrefs Site Audit: lanzar un nuevo crawl para verificar que el issue desaparece.

