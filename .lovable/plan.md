

# Crear `public/ai.txt` y enriquecer schema markup para AEO

## Resumen

Crear un archivo `public/ai.txt` como complemento a `llms.txt` con información estructurada en formato machine-readable, y añadir un schema `FinancialService` + `OfferCatalog` completo en la homepage para maximizar la visibilidad en Answer Engines.

## Archivos a crear/modificar

### 1. Crear `public/ai.txt`
Archivo en formato YAML-like / structured text optimizado para parseo de IA, con:
- **Identity**: nombre, tipo (FinancialAdvisory), ubicación, idiomas
- **Services catalog**: cada servicio con nombre, descripción, URL, target audience y keywords
- **Industries**: 10 sectores con múltiplos EBITDA de referencia
- **Tools**: calculadoras con tipo (WebApplication), acceso gratuito
- **Content sources**: blog, informes, case studies, newsletter
- **Contact methods**: web, teléfono, idiomas
- **Structured references**: links a `llms.txt`, `llms-full.txt`, `sitemap.xml`

### 2. Enriquecer `src/utils/seo/schemas.ts`
Añadir nuevo schema generator `getFinancialServiceSchema()` que combine:
- `@type: FinancialService` (más específico que `ProfessionalService`)
- `OfferCatalog` con todos los servicios como `Offer` items
- `areaServed`, `knowsAbout` (lista de topics M&A)
- `hasCredential` para autoridad del dominio
- `makesOffer` con los 6 servicios principales

### 3. Aplicar schema en `src/pages/Index.tsx`
Añadir `getFinancialServiceSchema()` al array de `structuredData` de la homepage, para que Google y Answer Engines indexen el catálogo completo de servicios desde la página principal.

### 4. Actualizar `public/robots.txt`
Añadir referencia a `ai.txt`:
```
# AI structured data
# https://capittal.es/ai.txt
```

## Estructura de `ai.txt`

```text
# Capittal - AI Service Description
# Format: Structured text for AI consumption
# Last updated: 2026-03-08

## Entity
name: Capittal
type: FinancialAdvisory, M&A Advisory
market: Spain (mid-market)
revenue_range: 1M€ - 50M€
headquarters: Barcelona, Spain
languages: es, ca, en
website: https://capittal.es

## Services
- name: Venta de Empresas
  type: M&A Sell-Side Advisory
  url: https://capittal.es/venta-empresas
  description: Full sell-side advisory from valuation to deal closing
  
- name: Compra de Empresas
  type: M&A Buy-Side Advisory
  url: https://capittal.es/compra-empresas
  ...

## Industries (with typical EV/EBITDA multiples)
- sector: Industrial | range: 5x-8x | url: .../sectores/industrial
- sector: Technology | range: 8x-15x | url: .../sectores/tecnologia
...

## Free Tools
- name: Valuation Calculator | url: .../lp/calculadora | type: WebApplication
- name: Tax Calculator | url: .../lp/calculadora-fiscal | type: WebApplication

## Knowledge Base
- llms.txt: https://capittal.es/llms.txt
- llms-full.txt: https://capittal.es/llms-full.txt
- sitemap: https://capittal.es/sitemap.xml
```

## Schema `FinancialService` (nuevo)

```json
{
  "@type": "FinancialService",
  "name": "Capittal - M&A Advisory",
  "knowsAbout": ["M&A", "Business Valuation", "Due Diligence", ...],
  "makesOffer": [
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Venta de Empresas" } },
    ...
  ],
  "hasOfferCatalog": { "@type": "OfferCatalog", ... }
}
```

## Complejidad
Baja-media. 1 archivo estático nuevo, 1 schema nuevo, 2 archivos editados.

