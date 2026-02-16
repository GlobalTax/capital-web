
## Auditoria SEO Completa - 118 Rutas del Mapa R

### Resumen ejecutivo

Se han auditado las 118 rutas del mapa `R` en `index.html` evaluando 3 pilares SEO: canonical, hreflang y structured data. Se detectan **3 problemas sistematicos** y **varios gaps puntuales**.

---

### 1. CANONICAL - Estado: CORRECTO (sin accion)

El script sincrono en `index.html` (lineas 177-181) genera el canonical automaticamente para **todas** las rutas:
```
var canon='https://capittal.es'+p;
cl.setAttribute('href',canon);
```
Ademas, los componentes React (SEOHead, useHreflang) lo refuerzan al montar. No hay conflictos detectados.

**Resultado: 118/118 rutas con canonical correcto.**

---

### 2. HREFLANG - Estado: PARCIAL (gaps detectados)

El hook `useHreflang.tsx` tiene un mapa de 99 entradas cubriendo las rutas multilingues principales. Sin embargo:

**Rutas con hreflang correcto (via useHreflang o implementacion manual):**
- Paginas principales ES/CA/EN: /, /ca, /en, /contacto, /equipo, /casos-exito, /por-que-elegirnos, /programa-colaboradores (incluyen hreflang manual en cada componente)
- Servicios ES/CA/EN: 6 servicios x 3 idiomas (via useHreflang en componentes de servicio)
- Sectores ES/CA/EN: cubiertos parcialmente en useHreflang (10 sectores, pero faltan algunos EN)
- Landing pages: /lp/calculadora, /lp/calculadora-fiscal, /lp/calculadora-asesores

**Rutas SIN hreflang (solo espanol, no tienen variante multilingue):**
Estas 40+ rutas no necesitan hreflang porque son solo en espanol. Sin embargo, el fallback del useHreflang apunta las 3 versiones a la misma URL, lo cual es correcto:
- /de-looper-a-capittal, /valoracion-empresas, /oportunidades, /politica-privacidad, /terminos-uso, /cookies
- Todas las /lp/* (excepto calculadoras)
- Todas las /search-funds/*
- /recursos/blog, /recursos/noticias, /recursos/case-studies, /recursos/newsletter, /recursos/webinars

**Problema 1: Sectores faltan en useHreflang.tsx**
Los siguientes sectores tienen ruta en R pero NO estan en el mapa de useHreflang:
| Sector | ES | CA (falta) | EN (falta) |
|--------|-----|------------|------------|
| Seguridad | /sectores/seguridad | /sectors/seguretat | /sectors/security |
| Construccion | /sectores/construccion | /sectors/construccio | - |
| Logistica | /sectores/logistica | /sectors/logistica | - |
| Medio ambiente | /sectores/medio-ambiente | /sectors/medi-ambient | - |
| Alimentacion | /sectores/alimentacion | /sectors/alimentacio | - |

Estos sectores no estan en el `routeMap` de `useHreflang.tsx` (lineas 73-98), por lo que cuando se visita `/sectores/seguridad` se genera hreflang apuntando ES/CA/EN a la misma URL en lugar de a sus variantes traducidas.

---

### 3. STRUCTURED DATA - Estado: PARCIAL (gaps detectados)

**Paginas CON structured data (correcto):**
- Homepage (/): Organization + WebPage
- Servicios ES (6/6): ServiceSchema via SEOHead
- Sectores ES (10/10): ServiceSchema + WebPageSchema
- Contacto: WebPageSchema
- Equipo: WebPageSchema
- Casos de exito: WebPageSchema
- Oportunidades: WebPageSchema + ProductSchema
- Blog: Blog schema
- Newsletter, Webinars, Case Studies: WebPageSchema
- Landing calculadoras: ServiceSchema
- De Looper a Capittal: WebPageSchema
- Valoracion Empresas: WebPageSchema + FAQSchema

**Problema 2: 11 paginas search-funds usan Helmet en vez de SEOHead y NO tienen structured data**
Todos los archivos en `src/pages/search-funds/` usan `react-helmet` (`Helmet`) en vez de `SEOHead`, y ninguno incluye structured data:
| Pagina | Archivo |
|--------|---------|
| /search-funds/recursos | SearchFundsResourceCenter.tsx |
| /search-funds/recursos/guia | SearchFundsGuide.tsx |
| /search-funds/recursos/glosario | SearchFundsGlossary.tsx |
| /search-funds/recursos/herramientas | SearchFundsTools.tsx |
| /search-funds/recursos/casos | SearchFundsCases.tsx |
| /search-funds/recursos/biblioteca | SearchFundsLibrary.tsx |
| /search-funds/recursos/comunidad | SearchFundsCommunity.tsx |
| /search-funds/recursos/sourcing | SearchFundsSourcing.tsx |
| /search-funds/recursos/valoracion | SearchFundsValuation.tsx |
| /search-funds/recursos/negociacion | SearchFundsNegotiation.tsx |
| /search-funds/recursos/post-adquisicion | SearchFundsPostAcquisition.tsx |

**Problema 3: Noticias (/recursos/noticias) no tiene structured data**
El SEOHead de Noticias no incluye `structuredData`. Deberia tener un WebPageSchema o CollectionPage.

**Problema menor: LPs con Helmet en vez de SEOHead**
- LandingOpenDeals.tsx: usa Helmet, sin structured data
- LandingOportunidadesMeta.tsx: usa Helmet, sin structured data (pero tiene noindex)
- LandingValoracion2026.tsx: usa Helmet, sin structured data (pero tiene noindex)

---

### 4. INCONSISTENCIA: Helmet vs SEOHead

Se detectan **15 archivos** que usan `react-helmet` (`Helmet`) en lugar del sistema estandar `SEOHead`. Esto causa:
- No se generan OG tags ni Twitter Cards
- No se inyecta structured data
- Posible conflicto con el script sincrono de `index.html` que ya gestiona canonical

---

### Plan de accion propuesto

**Prioridad 1 - Migrar search-funds de Helmet a SEOHead (11 archivos)**
- Reemplazar `Helmet` por `SEOHead` en los 11 archivos de search-funds
- Anadir `structuredData` con `getWebPageSchema()` a cada uno
- Anadir hreflang NO es necesario (solo existen en espanol)

**Prioridad 2 - Completar hreflang en useHreflang.tsx (5 sectores)**
- Anadir al `routeMap` los 5 sectores faltantes con sus variantes CA/EN:
  - seguridad/seguretat/security
  - construccion/construccio
  - logistica/logistica
  - medio-ambiente/medi-ambient
  - alimentacion/alimentacio

**Prioridad 3 - Anadir structured data a Noticias**
- Anadir `getWebPageSchema()` al SEOHead de `/recursos/noticias`

**Prioridad 4 (opcional) - Migrar LPs restantes de Helmet a SEOHead**
- LandingOpenDeals, LandingOportunidadesMeta, LandingValoracion2026

### Seccion tecnica

**Archivos a modificar:**
1. `src/hooks/useHreflang.tsx` - Anadir 5 sectores al routeMap (~15 lineas nuevas)
2. `src/pages/search-funds/SearchFundsResourceCenter.tsx` - Migrar Helmet a SEOHead + structured data
3. `src/pages/search-funds/SearchFundsGuide.tsx` - idem
4. `src/pages/search-funds/SearchFundsGlossary.tsx` - idem
5. `src/pages/search-funds/SearchFundsTools.tsx` - idem
6. `src/pages/search-funds/SearchFundsCases.tsx` - idem
7. `src/pages/search-funds/SearchFundsLibrary.tsx` - idem
8. `src/pages/search-funds/SearchFundsCommunity.tsx` - idem
9. `src/pages/search-funds/SearchFundsSourcing.tsx` - idem
10. `src/pages/search-funds/SearchFundsValuation.tsx` - idem
11. `src/pages/search-funds/SearchFundsNegotiation.tsx` - idem
12. `src/pages/search-funds/SearchFundsPostAcquisition.tsx` - idem
13. `src/pages/recursos/Noticias.tsx` - Anadir structuredData al SEOHead existente
14. `src/pages/LandingOpenDeals.tsx` - Migrar Helmet a SEOHead (opcional)
15. `src/pages/LandingOportunidadesMeta.tsx` - Migrar Helmet a SEOHead (opcional)
16. `src/pages/LandingValoracion2026.tsx` - Migrar Helmet a SEOHead (opcional)

**Patron de migracion Helmet a SEOHead:**
```typescript
// ANTES (Helmet)
import { Helmet } from 'react-helmet';
<Helmet>
  <title>...</title>
  <meta name="description" content="..." />
  <link rel="canonical" href="..." />
</Helmet>

// DESPUES (SEOHead)
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';
<SEOHead
  title="..."
  description="..."
  canonical="..."
  structuredData={getWebPageSchema("...", "...", "...")}
/>
```

Sin nuevas dependencias. Sin cambios en base de datos.
