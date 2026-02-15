
## Pre-rendering SEO: Analisis y solucion viable

### Situacion actual

El proyecto ya tiene un sistema SSR completo mediante Edge Functions:

- **`pages-ssr`**: Genera HTML completo con todo el contenido (headings, texto, enlaces, meta tags, JSON-LD) para ~40 rutas (home, servicios, sectores, contacto, calculadoras, legal).
- **`blog-ssr`**: Genera HTML completo para cada post del blog con Article schema.
- **`generate-sitemap`**: Genera sitemap XML dinamico con hreflang.

El problema no es la falta de contenido pre-renderizado -- ya existe. El problema es que **Google no llega a las Edge Functions**. Cuando Google visita `capittal.es/venta-empresas`, recibe el SPA con `<div id="root"></div>` vacio en lugar del HTML completo que ya genera `pages-ssr`.

### Por que Options A/B/C no funcionan en Lovable

| Opcion | Problema |
|--------|----------|
| `vite-plugin-ssr` / `vite-plugin-ssg` | Requiere reestructurar toda la app a un modelo SSR con server entries. No compatible con el build de Lovable. |
| `react-snap` | Requiere Puppeteer (Chrome headless) en build time. El entorno de build de Lovable no tiene Chrome instalado. |
| `prerender-spa-plugin` | Tambien requiere Chrome headless. Mismo problema. |

Estas herramientas necesitan un navegador real ejecutandose durante el build para renderizar cada pagina. El entorno de Lovable no lo soporta.

### Solucion propuesta: Dynamic Rendering via Edge Function

La solucion estandar para SPAs es **Dynamic Rendering** (recomendado por Google hasta 2024): un proxy en el edge que detecta crawlers y les sirve el HTML pre-renderizado, mientras los usuarios reales reciben la SPA normal.

#### Implementacion: Edge Function `prerender-proxy`

Crear una nueva Edge Function `prerender-proxy` que:

1. Recibe TODAS las peticiones entrantes (configurado como proxy en el dominio `capittal.es`)
2. Inspecciona el `User-Agent` para detectar bots (Googlebot, Bingbot, Slurp, DuckDuckBot, facebookexternalhit, Twitterbot, LinkedInBot, etc.)
3. **Si es un bot**: llama internamente a `pages-ssr` o `blog-ssr` con el path solicitado y devuelve el HTML completo
4. **Si es un usuario real**: devuelve un redirect 302 al SPA normal o sirve el `index.html` con un script que carga la app

```text
                Peticion a capittal.es/venta-empresas
                              |
                    prerender-proxy (Edge)
                       /            \
              Bot detectado     Usuario real
                  |                    |
          Llama pages-ssr        Sirve SPA normal
          con ?path=/venta-      (div id=root + JS)
          empresas
                  |
          Devuelve HTML completo
          con todo el contenido
```

#### Archivo: `supabase/functions/prerender-proxy/index.ts`

La funcion:

- Lista de User-Agents de bots conocidos para deteccion
- Para rutas `/blog/*`: llama a `blog-ssr`
- Para todas las demas rutas: llama a `pages-ssr`
- Incluye cache headers para que el CDN cache las respuestas de bots
- Fallback: si la Edge Function SSR falla, sirve la SPA normal

#### Configuracion necesaria fuera de Lovable

**IMPORTANTE**: Para que esto funcione, se necesita configurar el DNS/proxy del dominio `capittal.es` para que las peticiones pasen por la Edge Function. Esto se hace tipicamente con:

- **Cloudflare Workers** (si el dominio usa Cloudflare): Un Worker que intercepta peticiones y las enruta a la Edge Function
- **Vercel Edge Middleware** o similar
- **Nginx reverse proxy** con deteccion de User-Agent

Esta configuracion de infraestructura esta fuera del alcance de Lovable y debe hacerse en el panel de control del proveedor de hosting/DNS.

#### Alternativa inmediata: Enriquecer `index.html` con `noscript`

Como solucion parcial e inmediata (sin necesidad de configuracion externa), podemos anadir un bloque `<noscript>` al `index.html` que contenga:

- El contenido principal de la homepage (H1, H2, descripcion, enlaces a secciones principales)
- Un nav con enlaces a todas las paginas clave
- Texto descriptivo de los servicios

Esto no resuelve el problema para todas las paginas pero da a Google contenido basico en la raiz del sitio incluso sin JavaScript. Ademas, Google renderiza JavaScript en la mayoria de los casos, pero el `noscript` actua como red de seguridad.

### Plan de implementacion

1. **Crear `supabase/functions/prerender-proxy/index.ts`** - Edge Function que detecta bots y proxea a `pages-ssr`/`blog-ssr`
2. **Enriquecer `index.html`** - Anadir bloque `<noscript>` con contenido semantico de la homepage y navegacion completa
3. **Desplegar** la nueva Edge Function
4. **Documentar** los pasos de configuracion del dominio necesarios para activar el proxy

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/prerender-proxy/index.ts` | **Nuevo** - Proxy de dynamic rendering |
| `index.html` | Anadir `<noscript>` con contenido semantico |

### Limitaciones

- El proxy solo funciona cuando el dominio esta configurado para enrutar trafico a traves de el. Sin esa configuracion, la Edge Function existe pero no recibe peticiones.
- El bloque `<noscript>` solo cubre la homepage, no todas las rutas.
- Google actualmente renderiza JavaScript (usa Chrome 41+), por lo que en muchos casos ya puede ver el contenido de la SPA. El problema principal es con otros crawlers y con la primera indexacion.
