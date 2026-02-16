
# Cloudflare Worker para Dynamic Rendering de Bots

## Contexto

Actualmente, `capittal.es` es una SPA (Single Page Application) donde el contenido se carga via JavaScript. Existe una infraestructura SSR completa ya construida en Supabase Edge Functions (`prerender-proxy` -> `pages-ssr` / `blog-ssr`), pero **no hay nada que redirija el trafico de bots hacia ella**. Esto significa que Google, LinkedIn, WhatsApp y Twitter ven un HTML casi vacio.

La solucion es un **Cloudflare Worker** que intercepte las peticiones de bots y las redirija al endpoint SSR, mientras que los usuarios normales reciben la SPA sin cambios.

## Arquitectura

```text
  Usuario normal                    Bot (Google, LinkedIn...)
       |                                    |
       v                                    v
  Cloudflare DNS (capittal.es)      Cloudflare DNS (capittal.es)
       |                                    |
       v                                    v
  Worker: detecta UA             Worker: detecta UA = bot
  NO es bot                              |
       |                                 v
       v                         fetch(prerender-proxy?path=/X&ssr=1)
  Origin server (SPA)                    |
  index.html + JS                        v
                                 Supabase Edge Function
                                 HTML completo con:
                                 - Title, Description
                                 - Open Graph tags
                                 - JSON-LD
                                 - Contenido semantico
```

## Lo que se creara

Un archivo de referencia en el proyecto con el codigo completo del Cloudflare Worker, listo para copiar y desplegar en el dashboard de Cloudflare.

### Archivo: `cloudflare/worker-bot-prerender.js`

El Worker hara lo siguiente:

1. **Detectar bots** por User-Agent (misma lista de ~25 patrones que usa `prerender-proxy`)
2. **Excluir assets estaticos** (`.js`, `.css`, `.png`, `.jpg`, `.woff2`, etc.) para no interceptar recursos
3. **Excluir rutas privadas** (`/admin/`, `/auth/`, `/api/`) que no necesitan SSR
4. **Redirigir bots** al endpoint `prerender-proxy` de Supabase con `?path=/ruta&ssr=1`
5. **Pasar el User-Agent original** para que el proxy lo registre
6. **Cachear respuestas SSR** en Cloudflare Cache API (TTL de 1 hora) para evitar llamadas repetidas
7. **Fallback**: si el SSR falla, dejar pasar la peticion al origin (SPA) para que al menos se sirva algo

### Logica del Worker (pseudocodigo)

```text
1. Recibir request
2. Si es asset estatico (.js, .css, .png...) -> pasar al origin
3. Si es ruta excluida (/admin, /auth...) -> pasar al origin
4. Extraer User-Agent
5. Si NO es bot -> pasar al origin (SPA normal)
6. Si ES bot:
   a. Buscar en cache de Cloudflare (clave = path)
   b. Si hay cache -> devolver HTML cacheado
   c. Si no hay cache:
      - Llamar a prerender-proxy con ?path=X&ssr=1
      - Si respuesta OK -> cachear y devolver HTML
      - Si respuesta KO -> pasar al origin como fallback
```

## Detalles tecnicos

### Variables de entorno necesarias en Cloudflare

| Variable | Valor | Descripcion |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://fwhqtzkkvnjkazhaficj.supabase.co` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | (la anon key del proyecto) | Para autenticar las llamadas a Edge Functions |

### Bots cubiertos

Googlebot, Bingbot, Slurp (Yahoo), DuckDuckBot, Baiduspider, Yandexbot, facebookexternalhit, Twitterbot, LinkedInBot, WhatsApp, Telegrambot, Applebot, SEMrushBot, AhrefsBot, y otros crawlers comunes.

### Cache

- **TTL**: 1 hora para paginas normales, 5 minutos para blog (contenido mas dinamico)
- **Clave de cache**: URL completa normalizada (sin query params innecesarios)
- **Invalidacion**: Se puede purgar manualmente desde el dashboard de Cloudflare o esperar al TTL

### Headers de respuesta para bots

- `Content-Type: text/html; charset=utf-8`
- `X-Prerender: 1` (identificador de que fue servido via SSR)
- `X-Robots-Tag: all`
- `Cache-Control: public, max-age=3600`

## Pasos de despliegue (manual en Cloudflare)

Dado que Lovable no puede desplegar en Cloudflare directamente, los pasos que deberas seguir son:

1. Ir a **Cloudflare Dashboard** > Workers & Pages > Create Worker
2. Pegar el codigo del archivo `cloudflare/worker-bot-prerender.js`
3. Configurar las variables de entorno (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
4. Ir a **Workers Routes** y agregar la ruta: `capittal.es/*`
5. Verificar que el Worker tiene prioridad sobre cualquier otra regla

## Verificacion post-despliegue

Para comprobar que funciona:

```text
curl -H "User-Agent: Googlebot" https://capittal.es/
curl -H "User-Agent: facebookexternalhit" https://capittal.es/contacto
curl -H "User-Agent: LinkedInBot" https://capittal.es/lp/calculadora
```

Cada uno deberia devolver HTML completo con metadatos, contenido semantico y JSON-LD.

## Alcance

- Se crea 1 archivo nuevo: `cloudflare/worker-bot-prerender.js`
- No se modifican archivos existentes del proyecto
- No se modifican Edge Functions de Supabase (ya estan preparadas)
