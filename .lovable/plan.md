
## Edge Function de Pre-rendering SSR para paginas principales

### Problema
Las paginas principales de capittal.es (home, servicios, sectores) son una SPA renderizada en cliente. Los crawlers reciben HTML vacio sin contenido, meta tags ni structured data. El blog ya tiene SSR via `blog-ssr`, pero el resto del sitio no.

### Solucion
Crear una Edge Function `pages-ssr` que sirva HTML estatico completo para cada pagina principal cuando un crawler la solicita, siguiendo exactamente el patron de `blog-ssr`.

### Arquitectura

La funcion recibe un parametro `path` y devuelve HTML completo con:
- Meta tags unicos (title, description, OG, Twitter Cards)
- Canonical URL y hreflang
- JSON-LD structured data (Organization, Service, WebPage)
- Contenido textual semantico (H1, H2, parrafos descriptivos)
- Redireccion automatica a la SPA para usuarios normales (`meta http-equiv="refresh"`)
- Cache de 1 hora

### Paginas cubiertas (~20 rutas)

| Grupo | Rutas |
|-------|-------|
| Home | `/`, `/ca`, `/en` |
| Servicios | `/servicios/venta-empresas`, `/servicios/valoraciones`, `/servicios/due-diligence`, `/servicios/reestructuraciones`, `/servicios/planificacion-fiscal`, `/servicios/asesoramiento-legal` |
| Sectores | `/sectores/seguridad`, `/sectores/tecnologia`, `/sectores/industrial`, `/sectores/healthcare`, `/sectores/energia`, `/sectores/construccion`, `/sectores/logistica`, `/sectores/medio-ambiente`, `/sectores/retail-consumer`, `/sectores/alimentacion` |
| Otras | `/contacto`, `/equipo`, `/por-que-elegirnos`, `/casos-exito` |

### Detalles tecnicos

**1. Nueva Edge Function: `supabase/functions/pages-ssr/index.ts`**

- Recibe `?path=/servicios/venta-empresas` como query param
- Contiene un mapa estatico `PAGES_DATA` con el contenido SEO de cada pagina:
  - `title`, `description`, `keywords`
  - `canonical`, `hreflang`
  - `structuredData` (JSON-LD)
  - `content`: HTML semantico con H1, H2 y parrafos descriptivos del servicio/sector
- Reutiliza las funciones helper `escapeHtml()` y `safeJsonLd()` de `blog-ssr`
- Devuelve HTML completo con estilos inline minimalistas
- `meta http-equiv="refresh"` redirige a la SPA tras 3 segundos
- Header `Cache-Control: public, max-age=3600`
- Si la ruta no existe en el mapa, devuelve 404

**2. Configuracion: `supabase/config.toml`**

```toml
[functions.pages-ssr]
verify_jwt = false
```

**3. Actualizar `public/robots.txt`**

No requiere cambios directos, pero se podria considerar referenciar la Edge Function en un futuro para que los crawlers accedan directamente al HTML pre-renderizado.

### Estructura del mapa de contenido (ejemplo)

```text
PAGES_DATA = {
  "/": {
    title: "Capittal - Especialistas en M&A, Valoraciones y Due Diligence",
    description: "Capittal es su socio estrategico en operaciones de M&A...",
    canonical: "https://capittal.es/",
    structuredData: [Organization, WebPage, ProfessionalService],
    content: "<h1>Especialistas en Fusiones y Adquisiciones</h1>
              <p>Capittal asesora en compraventa de empresas...</p>
              <h2>Servicios</h2>..."
  },
  "/servicios/venta-empresas": {
    title: "Servicio de Venta de Empresas | M&A Profesional | Capittal",
    description: "Servicio profesional integral de M&A para venta...",
    ...
  },
  "/sectores/seguridad": {
    title: "M&A Sector Seguridad Privada en Espana | Capittal",
    description: "Especialistas en fusiones y adquisiciones...",
    ...
  },
  // ... ~20 paginas mas
}
```

### Como se usa

Los crawlers pueden acceder via:
```
https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/pages-ssr?path=/servicios/venta-empresas
```

Y reciben HTML completo con todo el contenido SEO, meta tags y structured data. Los usuarios normales son redirigidos automaticamente a `https://capittal.es/servicios/venta-empresas`.

### Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `supabase/functions/pages-ssr/index.ts` | Crear: Edge Function con mapa de ~20 paginas, HTML completo, meta tags, JSON-LD, hreflang |
| `supabase/config.toml` | Modificar: anadir `[functions.pages-ssr]` con `verify_jwt = false` |

### Notas
- El contenido se extrae directamente de lo que ya existe en los componentes React (titulos SEO, descripciones, structured data)
- No requiere base de datos: todo el contenido es estatico y esta hardcodeado en el mapa
- Para futuras actualizaciones de contenido, se puede migrar el mapa a una tabla de Supabase
