
# Añadir JSON-LD de Organization en index.html

## Problema
Actualmente no hay ningún bloque `<script type="application/ld+json">` en el HTML estatico. Los schemas JSON-LD solo se inyectan via React (invisible sin JS) o via el prerender-proxy (que requiere el Cloudflare Worker). Esto significa que cualquier bot que no ejecute JavaScript no ve datos estructurados.

## Solucion
Insertar un bloque `<script type="application/ld+json">` directamente en el `<head>` de `index.html`, justo antes del cierre `</head>` (linea 184). El schema sera identico al que usa `pages-ssr` para mantener consistencia.

## Cambio

**Archivo**: `index.html`

**Ubicacion**: Despues de la linea 183 (cierre del script sincrono) y antes de `</head>` (linea 184).

**Contenido a insertar**:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Capittal Transacciones",
  "legalName": "Capittal Transacciones S.L.",
  "url": "https://capittal.es",
  "logo": "https://capittal.es/logo.png",
  "description": "Firma de asesoramiento en M&A, valoraciones y due diligence especializada en el sector seguridad",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ausias March 36, Principal",
    "addressLocality": "Barcelona",
    "postalCode": "08010",
    "addressCountry": "ES"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": ["Spanish", "Catalan", "English"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/capittal-transacciones"
  ]
}
</script>
```

## Detalles tecnicos

- El schema es identico al `ORG_JSONLD` de `pages-ssr/index.ts` y `blog-ssr/index.ts`, con la adicion del `contactPoint` del schema de `src/utils/seo/schemas.ts`.
- Se usa un `id` fijo distinto (`org-static-jsonld`) para evitar conflicto con el `seo-structured-data` que inyecta el componente `SEOHead` via React.
- Es puro HTML estatico: no depende de JavaScript ni del Worker.
- Se benefician inmediatamente todos los bots (Google, Bing, redes sociales) sin necesidad de ejecutar JS.

## Alcance

- 1 archivo modificado: `index.html` (se insertan ~25 lineas)
- Sin cambios en componentes React, Edge Functions ni otros archivos
