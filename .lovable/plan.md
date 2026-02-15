
# Plan de Correccion SEO Integral - Capittal.es

## Diagnostico

Tras revisar el codigo en profundidad, los problemas son claros:

### 1. El SSR funciona, pero no llega a los bots
La Edge Function `pages-ssr` genera HTML correcto y diferenciado para cada ruta (verificado con test directo). El `prerender-proxy` tambien funciona. **Pero el hosting de Lovable no enruta las peticiones de bots a traves del proxy.** Cuando Googlebot visita `capittal.es/sectores/seguridad`, recibe el `index.html` generico de la SPA, no el HTML del SSR.

### 2. El `index.html` tiene la misma meta description para todo
La linea 8 del `index.html` tiene una meta description generica que es lo unico que Google ve antes de ejecutar JavaScript. Los componentes `SEOHead` actualizan los meta tags via JavaScript, pero muchos crawlers no ejecutan JS o lo hacen con retraso.

### 3. Redirecciones parciales
- `/home` -> `/` ya existe (linea 149 de AppRoutes)
- `/compra-empreses` -> `/compra-empresas` ya existe (linea 170)
- `/team` renderiza la pagina Equipo directamente (linea 196) en vez de redirigir
- No hay redirecciones de URLs raiz (`/venta-empresas`) a `/servicios/venta-empresas` ni viceversa (coexisten como paginas separadas)

## Solucion: 3 bloques de trabajo

### Bloque 1: Forzar meta tags para bots desde index.html (impacto critico)

Dado que no podemos controlar el routing del servidor en Lovable, la estrategia es inyectar un script en `index.html` que se ejecute **antes** del framework React y actualice los meta tags basandose en `window.location.pathname`. Esto no ayuda a crawlers que no ejecutan JS, pero Google si ejecuta JavaScript y leerá los meta tags actualizados.

**Archivo: `index.html`**
- Anadir un bloque `<script>` sincrono en el `<head>` (antes de los meta tags OG/Twitter) que:
  - Lee `window.location.pathname`
  - Busca en un mapa de rutas predefinido el title y description correctos
  - Actualiza `document.title`, `meta[name=description]`, `meta[property=og:*]` y `meta[name=twitter:*]` inmediatamente
  - Anade `link[rel=canonical]` dinamicamente
- Incluir en el mapa las ~25 rutas principales con sus titles y descriptions unicos
- Eliminar el preload de `/hero-slide-1.jpg` (ya no se usa)

### Bloque 2: Mejorar el contenido noscript con rutas especificas

El bloque `<noscript>` actual solo muestra contenido de la Home. Lo expandiremos para que sea mas util, pero no puede ser dinamico. Lo dejaremos como esta (ya es razonablemente bueno con la navegacion completa), porque el impacto principal viene del Bloque 1.

### Bloque 3: Redirecciones y limpieza de URLs

**Archivo: `src/core/routing/AppRoutes.tsx`**
- Cambiar `/team` de renderizar `<Equipo />` a `<Navigate to="/equipo" replace />` (redirecion 301 client-side)
- Decidir si `/venta-empresas` y `/servicios/venta-empresas` son paginas diferentes (actualmente lo son: `VentaEmpresas.tsx` vs `servicios/VentaEmpresas.tsx`). Segun la auditoria, deberian unificarse. Propuesta: mantener ambas pero con canonical que apunte a la version `/servicios/` para evitar duplicacion.

**Archivo: `src/core/routing/HostRedirects.tsx`**
- Ya existe la redireccion de `www` -> sin `www`, que esta bien.

### Bloque 4: Sitemap y robots.txt

- `public/robots.txt` ya existe y esta correcto (apunta a sitemap.xml, bloquea admin/auth)
- `public/sitemap.xml` ya existe con todas las rutas, hreflang y multilingue. Sin embargo, incluye `/compra-empreses` como pagina indexable cuando deberia ser una redireccion. Limpiar entradas que son redirecciones.

---

## Detalle tecnico

### Mapa de meta tags para index.html (Bloque 1)

Se creara un objeto JavaScript inline con las ~25 rutas prioritarias:

```text
{
  "/": { t: "Capittal | Asesores M&A Especializados...", d: "Capittal Transacciones asesora en fusiones..." },
  "/venta-empresas": { t: "Venta de Empresas | Asesoramiento...", d: "Quiere vender su empresa? Capittal le acompaña..." },
  "/servicios/venta-empresas": { t: "Servicio de Venta de Empresas...", d: "Servicio profesional integral..." },
  "/sectores/seguridad": { t: "M&A Sector Seguridad...", d: "Capittal es la firma lider en M&A del sector seguridad..." },
  "/contacto": { t: "Contacto | Capittal...", d: "Hablemos sobre tu proxima operacion..." },
  "/equipo": { t: "Nuestro Equipo...", d: "Conoce al equipo de Capittal..." },
  "/lp/calculadora": { t: "Calculadora de Valoracion...", d: "Calcule el valor orientativo de su empresa..." },
  // ... resto de rutas
}
```

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `index.html` | Script sincrono de meta tags por ruta + eliminar preload hero-slide-1.jpg |
| `src/core/routing/AppRoutes.tsx` | /team -> redirect a /equipo |
| `public/sitemap.xml` | Eliminar entradas que son redirecciones (/compra-empreses como pagina independiente) |

### Limitaciones conocidas

- **Crawlers sin JS**: Los bots que no ejecutan JavaScript seguiran viendo el contenido por defecto del `index.html`. Google SI ejecuta JS, asi que este enfoque funciona para Google. Para LinkedIn, Facebook, Twitter (que no ejecutan JS), los meta tags OG del `index.html` seran los genericos a menos que se use una solucion de proxy externa.
- **Solucion definitiva**: Para un rendering perfecto para todos los bots, se necesitaria un proxy externo (Cloudflare Workers, Vercel, etc.) que intercepte las peticiones de bots y las enrute a `prerender-proxy`. Esto esta fuera del alcance de Lovable pero el SSR ya esta preparado para ello.
