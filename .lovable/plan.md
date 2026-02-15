

## Optimizar la pagina de calculadora de valoracion para SEO

### Resumen

Anadir contenido SEO estructurado (H1 visible, secciones explicativas, FAQ con accordion y JSON-LD) a la pagina `/lp/calculadora`, manteniendo la calculadora interactiva above the fold. Tambien actualizar el SSR en `pages-ssr` para que los crawlers reciban todo el contenido.

### Cambios propuestos

#### 1. Nuevo componente: `src/components/landing/CalculatorSEOContent.tsx`

Componente que contiene todo el contenido SEO debajo de la calculadora:

**Seccion 1 - Intro (encima de la calculadora, dentro del layout):**
- H1 visible: "Calculadora de Valoracion de Empresas" (reemplaza el H1 `sr-only` actual)
- Parrafo introductorio (2-3 frases): explica que la herramienta es para empresarios que quieren vender, inversores evaluando adquisiciones, o emprendedores curiosos sobre el valor de su empresa

**Seccion 2 - Contenido SEO (debajo de la calculadora):**

- **H2: "Como funciona nuestra calculadora de valoracion?"**
  - Explicacion de la metodologia: multiples de EBITDA, benchmarks sectoriales, ajustes por tamano/crecimiento/margen
  - 3-4 parrafos, ~400-500 palabras

- **H2: "Cuando necesitas valorar tu empresa?"**
  - Lista de escenarios: venta, entrada de socio, herencia, financiacion, planificacion estrategica
  - ~200-300 palabras

- **H2: "Valoracion profesional vs. calculadora online"**
  - Explicacion de que la calculadora da una estimacion orientativa
  - CTA: "Solicita una valoracion profesional" enlazando a `/contacto`
  - ~150-200 palabras

**Seccion 3 - FAQ (accordion):**
- Usa componentes `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` de shadcn/ui
- 5 preguntas:
  1. Es gratuita la calculadora de valoracion?
  2. Que metodos de valoracion utilizais?
  3. Cuanto tarda una valoracion profesional?
  4. Los datos que introduzco son confidenciales?
  5. Que sectores cubre la calculadora?

#### 2. Modificar `src/pages/LandingCalculator.tsx`

- Reemplazar el H1 `sr-only` (linea 187) por un H1 visible con parrafo introductorio encima de `UnifiedCalculator`
- Importar y renderizar `CalculatorSEOContent` despues de `ConfidentialityBlock` y `CapittalBrief`
- Anadir FAQ Schema (JSON-LD) al array `structuredData` del `SEOHead` usando `getFAQSchema` ya existente en `src/utils/seo/schemas.ts`

**Estructura resultante del JSX:**
```
UnifiedLayout
  LanguageSelector
  H1 visible + parrafo intro
  UnifiedCalculator (above the fold, interactivo)
  ConfidentialityBlock
  CapittalBrief
  CalculatorSEOContent (H2s + FAQ accordion)
```

#### 3. Actualizar SSR en `supabase/functions/pages-ssr/index.ts`

Expandir el campo `content` de la ruta `/lp/calculadora` (lineas 1021-1026) para incluir todo el contenido SEO: los 3 bloques H2, la seccion FAQ con preguntas y respuestas, y el CTA a contacto. Tambien anadir el FAQPage schema al array `structuredData`.

Esto garantiza que los crawlers que reciben el HTML via SSR vean exactamente el mismo contenido que se renderiza en el cliente.

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/landing/CalculatorSEOContent.tsx` | **Nuevo** - Contenido SEO + FAQ accordion |
| `src/pages/LandingCalculator.tsx` | H1 visible, importar CalculatorSEOContent, anadir FAQ schema |
| `supabase/functions/pages-ssr/index.ts` | Expandir contenido SSR de `/lp/calculadora` con todo el texto SEO y FAQ schema |

### Detalles tecnicos

- El FAQ accordion usa los componentes existentes de `@/components/ui/accordion`
- El FAQ Schema JSON-LD usa `getFAQSchema()` de `@/utils/seo/schemas.ts` -- ya implementado
- El CTA "Solicita una valoracion profesional" usa `react-router-dom` `Link` a `/contacto`
- Todo el contenido es estatico (no requiere fetch de datos), por lo que no hay impacto en rendimiento
- El H1 visible reemplaza el actual `sr-only` -- mejora SEO sin perder accesibilidad

