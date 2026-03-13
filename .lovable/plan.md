

## Revisión del análisis recibido

### Lo que YA está implementado (no hay que hacer nada)

1. **Canonical estático en `index.html`**: Ya existe en línea 15: `<link rel="canonical" href="https://capittal.es/" />`. Se actualizó en el último cambio.
2. **Script que actualiza el canonical**: Líneas 178-181 ya usan `querySelector` para actualizar el `href` del tag existente (no `createElement`).
3. **Blog SSR**: Existe `blog-ssr` edge function que genera HTML completo con title, description, canonical y structured data para cada post, consultando Supabase.
4. **Prerender-proxy**: Redirige bots a `blog-ssr` (para `/blog/*`) o `pages-ssr` (para el resto). AhrefsBot está en la lista de bots reconocidos.

### Lo que SÍ falta (el análisis tiene razón)

1. **`og:url` no existe en el HTML estático ni en el script síncrono**: No hay ningún `<meta property="og:url">` en `index.html`. El script síncrono tampoco lo inyecta. Solo `SEOHead` (React, client-side) lo hace. Esto afecta a bots que no ejecutan JS y no pasan por el prerender.

2. **Noticias individuales (`/recursos/noticias/:slug`) no tienen SSR**: El `prerender-proxy` solo redirige `/blog/*` a `blog-ssr`. Las noticias van a `pages-ssr`, que solo tiene la ruta `/recursos/noticias` (listado), no las individuales con slug. Los bots reciben el fallback genérico con el título de la home.

### Plan de cambios

#### 1. Añadir `og:url` estático + actualización en script síncrono (`index.html`)

- Añadir `<meta property="og:url" content="https://capittal.es/" />` en el `<head>` estático (junto a los otros OG tags).
- En el script síncrono (línea 178-181), añadir lógica para actualizar `og:url` con el canonical de la ruta actual.

#### 2. Crear SSR para noticias individuales

Opción A (recomendada): Ampliar `prerender-proxy` para que las rutas `/recursos/noticias/:slug` se redirijan a una nueva edge function `news-ssr` (similar a `blog-ssr`) que consulte la tabla de noticias en Supabase y genere HTML con title, description, canonical y OG tags propios.

Opción B: Añadir lógica en `pages-ssr` para detectar `/recursos/noticias/:slug` y consultar Supabase dinámicamente (menos limpio pero sin crear nueva función).

#### Ficheros a crear/editar

- `index.html` — añadir `og:url` estático y actualización en script
- `supabase/functions/news-ssr/index.ts` — nueva edge function para noticias (similar a `blog-ssr`)
- `supabase/functions/prerender-proxy/index.ts` — añadir routing de `/recursos/noticias/:slug` hacia `news-ssr`

