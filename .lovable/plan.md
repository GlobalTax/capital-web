

## Configurar Cloudflare Worker para servir el sitemap dinamico

### Contexto
Lovable no puede crear ni desplegar Cloudflare Workers directamente, ya que son infraestructura externa. Este plan proporciona el codigo completo del Worker y las instrucciones paso a paso para configurarlo en tu dashboard de Cloudflare.

### Que hace el Worker
Cuando un visitante o bot solicita `https://capittal.es/sitemap.xml`, el Worker intercepta la peticion y la redirige a la Edge Function de Supabase (`generate-sitemap`), devolviendo el sitemap dinamico con cabeceras XML correctas y cache de 1 hora.

### Codigo del Cloudflare Worker

```javascript
const SITEMAP_FUNCTION_URL =
  "https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/generate-sitemap";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Solo interceptar /sitemap.xml
    if (url.pathname !== "/sitemap.xml") {
      return fetch(request);
    }

    try {
      const response = await fetch(SITEMAP_FUNCTION_URL, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        // Fallback: devolver el sitemap estatico del origen
        return fetch(request);
      }

      const xml = await response.text();

      return new Response(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
          "X-Robots-Tag": "noindex",
        },
      });
    } catch (err) {
      console.error("Sitemap worker error:", err);
      // Fallback al origen (sitemap estatico)
      return fetch(request);
    }
  },
};
```

### Instrucciones de configuracion en Cloudflare

**Paso 1: Crear el Worker**
1. Entra en tu dashboard de Cloudflare > Workers & Pages
2. Clic en "Create" > "Create Worker"
3. Ponle nombre: `capittal-sitemap`
4. Pega el codigo de arriba y haz clic en "Deploy"

**Paso 2: Configurar la ruta**
1. Ve a tu dominio `capittal.es` en Cloudflare > Workers Routes
2. Anade una nueva ruta: `capittal.es/sitemap.xml` apuntando al worker `capittal-sitemap`

**Paso 3: Actualizar robots.txt (en Lovable)**
Cambiar la directiva Sitemap en `public/robots.txt` para que apunte al dominio principal en lugar de la URL de Supabase:

```
Sitemap: https://capittal.es/sitemap.xml
```

Esto es mejor para SEO porque Google prefiere que el sitemap este en el mismo dominio.

### Seguridad
- La anon key de Supabase es publica por diseno (las RLS policies protegen los datos)
- El Worker solo lee datos publicos (posts publicados)
- Si la Edge Function falla, el Worker hace fallback al archivo estatico `sitemap.xml`

### Cambios en Lovable
Solo se modifica un archivo: `public/robots.txt` (cambiar la URL del Sitemap al dominio principal).
Sin nuevas dependencias.

