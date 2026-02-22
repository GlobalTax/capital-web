

# Estrategia AEO: Contenido Pilar en /valoracion-empresas

## Objetivo

Transformar la pagina actual (~800 palabras) en un contenido pilar de 3000+ palabras optimizado para Answer Engine Optimization (AEO), con structured data completo (FAQPage, HowTo, WebApplication) para maximizar la visibilidad de Capittal en ChatGPT, Perplexity y otros motores de IA.

## Estado Actual

- La pagina tiene 4 secciones cortas: Hero, Metodos (4 tarjetas), CTA Calculadora, FAQ (5 preguntas)
- Structured data: solo WebPage + FAQPage
- Contenido insuficiente para que LLMs lo citen como fuente autoritativa

## Cambios Planificados

### 1. Nuevo schema: WebApplication (schemas.ts)

Agregar `getWebApplicationSchema()` en `src/utils/seo/schemas.ts` para describir la calculadora como herramienta web con datos de tipo SoftwareApplication/WebApplication, incluyendo nombre, URL, categoria, precio (gratuito) y sistema operativo.

### 2. Expansion masiva del contenido (ValoracionEmpresas.tsx)

Reescribir la pagina completa con las siguientes secciones de contenido extenso:

**Seccion 1 - Hero ampliado** (~200 palabras)
- H1 optimizado para AEO
- Parrafo introductorio denso en keywords naturales
- Contexto del mercado espanol de M&A

**Seccion 2 - Por que valorar tu empresa** (~400 palabras)
- 6 escenarios detallados: venta, inversion, sucesion, fiscalidad, socios, estrategia
- Cada escenario con explicacion de 2-3 lineas

**Seccion 3 - Metodos de Valoracion ampliados** (~800 palabras)
- 4 metodos con descripcion extensa (150-200 palabras cada uno)
- Cuando usar cada metodo
- Ventajas y limitaciones
- Ejemplo practico simplificado

**Seccion 4 - Proceso paso a paso** (~400 palabras)
- 6 pasos del proceso de valoracion
- Contenido alineado con el schema HowTo
- Desde recopilacion de datos hasta informe final

**Seccion 5 - Factores que afectan la valoracion** (~300 palabras)
- Crecimiento, rentabilidad, sector, posicion competitiva
- Dependencia del fundador, diversificacion de clientes

**Seccion 6 - Valoracion gratuita vs profesional** (~300 palabras)
- Tabla comparativa
- Cuando elegir cada opcion

**Seccion 7 - CTA Calculadora** (existente, sin cambios)

**Seccion 8 - FAQ ampliado** (~600 palabras)
- Ampliar de 5 a 10 preguntas
- Nuevas preguntas orientadas a queries de IA:
  - "Como se calcula el valor de una empresa en Espana"
  - "Cuanto vale una empresa que factura 1 millon"
  - "Que multiplo de EBITDA aplica a mi sector"
  - "Diferencia entre valor de empresa y valor de equity"
  - "Es obligatorio valorar una empresa para venderla"

**Seccion 9 - CTA Profesional** (existente, sin cambios)

### 3. Structured Data completo

La pagina incluira 4 schemas combinados:
- **WebPage**: Metadata de la pagina (existente)
- **FAQPage**: 10 preguntas frecuentes (ampliado)
- **HowTo**: "Como valorar una empresa en Espana" con 6 pasos (nuevo, usando `getHowToSchema` existente)
- **WebApplication**: Calculadora de valoracion gratuita (nuevo)

### 4. Actualizacion SSR (pages-ssr/index.ts)

Actualizar los metadatos de la ruta `/valoracion-empresas` en el edge function de SSR para incluir los nuevos schemas HowTo y WebApplication, asegurando que los bots reciban el structured data completo sin ejecutar JavaScript.

## Detalle Tecnico

**Archivos modificados:**
- `src/utils/seo/schemas.ts` - Agregar `getWebApplicationSchema()`
- `src/pages/ValoracionEmpresas.tsx` - Reescribir con contenido pilar completo + schemas
- `supabase/functions/pages-ssr/index.ts` - Actualizar structured data para `/valoracion-empresas`

**Principios AEO aplicados:**
- Contenido factual y citable (datos, porcentajes, rangos)
- Respuestas directas a preguntas frecuentes en formato Q&A
- Estructura semantica clara (H1 > H2 > H3)
- Lenguaje natural que coincide con queries de voz/IA
- Datos propietarios diferenciadores (rangos de multiplos por sector)

