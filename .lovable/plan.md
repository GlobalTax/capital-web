

# Plan de Mejoras SEO y Marketing Digital - Capittal.es

Basado en la auditoria completa del codigo fuente, estas son las mejoras priorizadas por impacto.

---

## QUICK WINS (Impacto alto, esfuerzo bajo)

### 1. Pagina 404 profesional con CTA y SEO
**Estado actual:** Pagina 404 basica con solo "Pagina no encontrada" y un boton.
**Mejora:** Redisenar con sugerencias de navegacion (servicios populares, calculadora, blog), buscador integrado, y tracking del error para detectar enlaces rotos.
- Archivo: `src/pages/NotFound.tsx`

### 2. Completar schema Organization con redes sociales
**Estado actual:** El array `sameAs` solo tiene LinkedIn (tanto en `index.html` como en `schemas.ts`).
**Mejora:** Anadir todas las redes sociales activas (Twitter/X, YouTube, Instagram, etc.) en ambas ubicaciones.
- Archivos: `index.html` (linea 205-207), `src/utils/seo/schemas.ts` (linea 22-24)

### 3. Implementar monitoreo de Web Vitals
**Estado actual:** No existe ningun tracking de Core Web Vitals (LCP, CLS, INP).
**Mejora:** Instalar `web-vitals` y enviar metricas a Google Analytics 4 para monitorear rendimiento real de usuarios.
- Archivo nuevo: `src/utils/webVitals.ts`
- Modificar: `src/main.tsx` para inicializar

### 4. Anadir BreadcrumbList schema JSON-LD a paginas de servicios y sectores
**Estado actual:** Breadcrumbs visuales existen en blog y documentacion, pero solo algunas paginas (SearchFunds, ValoracionEmpresas) tienen `getBreadcrumbSchema()` en su structured data.
**Mejora:** Anadir `getBreadcrumbSchema()` a todas las paginas de servicios (`/servicios/*`) y sectores (`/sectores/*`).
- Archivos: Paginas de servicios y sectores que no lo tienen

---

## MEJORAS DE IMPACTO MEDIO (1-2 dias)

### 5. Trust signals en homepage: logos de clientes y sellos
**Estado actual:** Existen componentes de trust signals en suiteloop (`TrustSignals.tsx`) y venta-empresas (`VentaEmpresasGuarantees.tsx`), pero la homepage no tiene una seccion visible de logos de clientes o certificaciones above the fold.
**Mejora:** Crear componente `ClientLogosBar` reutilizable con logos de clientes/partners y anadirlo a la homepage.
- Archivo nuevo: `src/components/shared/ClientLogosBar.tsx`
- Modificar: Homepage para incluir la seccion

### 6. Paginas de sectores sin FAQ schema
**Estado actual:** Las paginas de sector usan `SectorFAQ.tsx` que inyecta FAQPage schema via `dangerouslySetInnerHTML`. Sin embargo, algunas paginas de sector antiguas (v1) podrian no usar este componente.
**Mejora:** Auditar todas las paginas de `/sectores/*` y asegurar que todas usen `SectorFAQ` o `getFAQSchema()` consistentemente.
- Archivos: Paginas de sector individuales

### 7. Mejorar description del schema Organization
**Estado actual:** La description dice "especializada en el sector seguridad" lo cual es limitante.
**Mejora:** Cambiar a una descripcion mas amplia que cubra todos los sectores.
- Archivo: `index.html` (linea 192)

---

## MEJORAS ESTRATEGICAS (3-5 dias)

### 8. Structured data LocalBusiness para Google Maps
**Estado actual:** Solo schema Organization. No hay LocalBusiness.
**Mejora:** Anadir schema `ProfessionalService` (subtipo de LocalBusiness) con horarios, coordenadas GPS, telefono y area de servicio. Esto mejora visibilidad en Google Maps y busquedas locales.
- Archivo: `index.html` o `src/utils/seo/schemas.ts`

### 9. Internal linking automatizado en blog
**Estado actual:** El blog tiene contenido pero no hay sistema automatico de enlaces internos.
**Mejora:** Crear un sistema que detecte keywords clave en posts del blog y genere automaticamente enlaces a paginas de servicios o sectores relevantes.

### 10. Mejorar robots.txt con reglas para recursos estaticos
**Estado actual:** robots.txt basico con Disallow de admin y auth.
**Mejora:** Anadir reglas para evitar indexacion de parametros UTM, reglas especificas para Googlebot y otros bots, y cacheo adecuado.
- Archivo: `public/robots.txt`

---

## Seccion tecnica: Detalles de implementacion

### Pagina 404 (Quick Win 1)
```text
NotFound.tsx:
- Grid de 3 columnas con enlaces a: Servicios, Sectores, Calculadora
- Barra de busqueda simple que redirige al blog
- Tracking: enviar evento a GA4 con la ruta intentada
- SEO: noindex via SEOHead
```

### Web Vitals (Quick Win 3)
```text
Nuevo archivo src/utils/webVitals.ts:
- import { onLCP, onCLS, onINP } from 'web-vitals'
- Enviar cada metrica como evento de GA4
- Inicializar en main.tsx despues del render

Dependencia nueva: web-vitals (^4.x)
```

### Schema LocalBusiness (Mejora 8)
```text
{
  "@type": "ProfessionalService",
  "name": "Capittal Transacciones",
  "address": { ya existente },
  "geo": { "@type": "GeoCoordinates", "latitude": 41.3946, "longitude": 2.1756 },
  "openingHoursSpecification": { lunes-viernes 9-18 },
  "telephone": "+34695717490",
  "areaServed": "ES",
  "priceRange": "€€€"
}
```

### Trust Signals Homepage (Mejora 5)
```text
Reutilizar patron de VentaEmpresasGuarantees.tsx
Componente horizontal con logos en grayscale
Animacion sutil de scroll (ya existe embla-carousel)
Ubicar debajo del hero, antes de servicios
```

---

## Orden de ejecucion recomendado

1. Quick Wins 1-4 (se pueden hacer en paralelo, ~1 dia)
2. Mejoras 5-7 (impacto medio, ~1-2 dias)
3. Mejoras 8-10 (estrategicas, ~3-5 dias)

Todas las mejoras son backward-compatible y no rompen funcionalidad existente.

