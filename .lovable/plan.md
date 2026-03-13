

## Diagnóstico: "Duplicate pages without canonical" — 552 páginas

### Problema raíz

El `index.html` estático **no tiene un `<link rel="canonical">` en el HTML**. Solo se crea vía JavaScript (línea 180, `document.createElement`). 

Hay 3 capas que gestionan canonical:
1. **Script síncrono en `index.html`** (línea 177-181): crea el `<link>` con JS → invisible para crawlers sin JS
2. **`pages-ssr` edge function**: inyecta canonical pero solo cubre ~17 rutas estratégicas
3. **`SEOHead` componente React**: lo gestiona client-side → invisible para crawlers sin JS

El resultado: Google ve ~552 URLs sin canonical porque:
- La mayoría de rutas no pasan por `pages-ssr`
- El HTML estático no tiene `<link rel="canonical">` como elemento nativo
- El Cloudflare Worker puede no estar interceptando todo el tráfico de bots

### Solución

**Añadir un `<link rel="canonical">` estático en el `<head>` de `index.html`** como fallback nativo que siempre estará presente antes de cualquier JavaScript.

#### Cambio en `index.html`

Añadir después de la línea del favicon (línea 14):
```html
<link rel="canonical" href="https://capittal.es/" />
```

Y modificar el script síncrono existente (línea 180) para que en lugar de crear el elemento con `createElement`, simplemente **actualice el `href`** del canonical existente:

```javascript
// Canonical link (update existing)
var canon='https://capittal.es'+p;
var cl=document.querySelector('link[rel="canonical"]');
if(cl) cl.setAttribute('href',canon);
```

Esto garantiza que:
- Siempre hay un `<link rel="canonical">` en el HTML estático (visible sin JS)
- El script síncrono lo actualiza al pathname correcto inmediatamente
- `SEOHead` y `useCanonicalURL` lo refinan después si hay lógica especial

#### Detalle técnico

```text
ANTES (invisible para bots sin JS):
  <head>
    ...
    <!-- NO hay <link rel="canonical"> en HTML -->
    <script>
      // createElement('link') → solo funciona si se ejecuta JS
    </script>
  </head>

DESPUÉS (siempre visible):
  <head>
    ...
    <link rel="canonical" href="https://capittal.es/" />
    <script>
      // querySelector + setAttribute → actualiza el existente
    </script>
  </head>
```

### Ficheros a editar
- `index.html` — añadir tag canonical estático + simplificar script

### Nota importante
Este fix cubre el lado del código de Lovable/React. Si el Cloudflare Worker no está redirigiendo correctamente el tráfico de bots al `prerender-proxy`, eso requeriría revisión aparte en Cloudflare (fuera de Lovable). Pero con el canonical estático en el HTML, incluso sin SSR, Google verá siempre un canonical válido.

