
## Structured Data JSON-LD completo en SSR

### Resumen

Enriquecer el sistema SSR con datos estructurados JSON-LD segun las especificaciones de Schema.org, cubriendo todas las paginas: Organization global, LocalBusiness para contacto, Service para venta/compra, WebApplication para calculadoras, Article para blog, y FAQPage para secciones con acordeon.

### Cambios por archivo

#### 1. `supabase/functions/pages-ssr/index.ts`

**a) Actualizar `ORG_JSONLD` (lineas 23-37)**

Reemplazar el objeto Organization actual con la version completa solicitada:

```text
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
  "sameAs": ["https://www.linkedin.com/company/capittal-transacciones"]
}
```

**b) Inyectar Organization en TODAS las paginas**

Modificar la funcion `buildPageHtml` (linea 995) para inyectar automaticamente el bloque Organization como un `<script type="application/ld+json">` adicional en todas las paginas, ademas del `structuredData` especifico de cada pagina. Esto evita tener que duplicar el schema Organization en cada entrada del mapa.

**c) Actualizar `/contacto` structuredData (lineas 567-588)**

Anadir `geo`, que falta actualmente:

```text
"geo": {
  "@type": "GeoCoordinates",
  "latitude": 41.3935,
  "longitude": 2.1753
}
```

Ya tiene `openingHours` y `telephone` correctos.

**d) Actualizar `/venta-empresas` y `/compra-empresas` (lineas 728-770)**

Anadir `"serviceType": "Mergers and Acquisitions Advisory"` al schema Service. Tambien hacer lo mismo para las rutas `/servicios/venta-empresas` (linea 116) y `/servicios/due-diligence` etc. que ya tienen Service pero con `serviceType` en espanol. Se anadira el campo en ingles estandarizado como segundo serviceType.

**e) Anadir rutas LP calculadora al mapa**

Anadir las siguientes entradas nuevas al mapa `PAGES_DATA`:

- `/lp/calculadora` - con schema WebApplication:
```text
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Calculadora de Valoracion de Empresas - Capittal",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "provider": ORG_JSONLD
}
```

- `/lp/calculadora-fiscal` - con schema WebApplication similar enfocado a fiscalidad.

**f) Anadir FAQPage schema a paginas con secciones FAQ**

Para las siguientes rutas que tienen componentes SectorFAQ o FAQ especificos, anadir un bloque FAQPage en su `structuredData`:

- `/sectores/seguridad` (ya tiene SectorFAQ en la pagina)
- `/sectores/tecnologia`
- `/sectores/industrial`
- `/sectores/healthcare`
- `/sectores/energia`
- `/sectores/construccion`
- `/sectores/logistica`
- `/sectores/medio-ambiente`
- `/sectores/retail-consumer`
- `/sectores/alimentacion`
- `/servicios/venta-empresas`
- `/servicios/valoraciones`
- `/servicios/planificacion-fiscal`
- `/servicios/asesoramiento-legal`
- `/servicios/reestructuraciones`

Para cada una, se incluira un array `mainEntity` con las preguntas y respuestas que ya existen en los componentes FAQ del frontend. Ejemplo:

```text
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Como se valora una empresa de seguridad?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Se utilizan multiplos EBITDA especificos del sector..."
      }
    }
  ]
}
```

Nota: Esto implica leer los FAQ de cada componente frontend y duplicar las preguntas/respuestas en el mapa SSR. Es la unica forma de que los buscadores las vean server-side.

#### 2. `supabase/functions/blog-ssr/index.ts`

El blog SSR ya tiene un schema Article correcto (lineas 77-94) con:
- `headline`, `description`, `image`
- `author` (Person), `publisher` (Organization)
- `datePublished`, `dateModified`
- `mainEntityOfPage`, `keywords`, `articleSection`

Cambios necesarios:
- Actualizar el `publisher` para usar la version completa de Organization (con `legalName`, `description`, `sameAs`, direccion actualizada)
- Anadir el bloque Organization global como segundo `<script type="application/ld+json">` (igual que en pages-ssr)

### Secuenciacion

1. Actualizar `ORG_JSONLD` y la funcion `buildPageHtml` para inyectar Organization global
2. Actualizar `/contacto` con geo coordinates
3. Actualizar rutas de venta/compra con serviceType estandarizado
4. Anadir entradas LP calculadora con WebApplication
5. Anadir FAQPage a todas las rutas con secciones FAQ (sector + servicios)
6. Actualizar blog-ssr con Organization actualizado
7. Redesplegar ambas Edge Functions

### Volumen estimado

- ~20 rutas de sectores/servicios recibiran FAQPage schema (cada una con 3-6 preguntas)
- 2 rutas LP nuevas
- 1 Organization global en todas las paginas
- El archivo pages-ssr crecera significativamente (~300-400 lineas adicionales por las FAQs)
