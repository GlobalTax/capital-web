
# Guia Completa de Valoracion de Empresas: /guia-valoracion-empresas

## Objetivo

Crear una pagina pilar de 4000+ palabras en `/guia-valoracion-empresas` enfocada en **ejemplos reales del mercado espanol**, con datos concretos de transacciones, multiplos por sector y casos practicos. Esta pagina complementa `/valoracion-empresas` (orientada a la calculadora) y compite directamente con eValora y PRETIVM en busquedas genericas como "como valorar una empresa", "metodos de valoracion de empresas" y "multiplos EBITDA Espana".

## Diferenciacion vs /valoracion-empresas

| Aspecto | /valoracion-empresas | /guia-valoracion-empresas |
|---------|---------------------|--------------------------|
| Enfoque | Calculadora + resumen de metodos | Guia educativa con ejemplos reales |
| CTA principal | Calculadora gratuita | Contacto profesional + Calculadora |
| Contenido | 3000 palabras, metodos resumidos | 4000+ palabras, casos practicos con numeros |
| Target SEO | "valoracion empresas Espana" | "como valorar empresa", "metodos valoracion" |
| Structured Data | WebPage + FAQ + HowTo + WebApp | Article + FAQ + HowTo |

## Estructura del Contenido

### Secciones de la pagina (9 secciones)

1. **Hero** (~200 palabras) - H1: "Guia Completa de Metodos de Valoracion de Empresas: Ejemplos Reales del Mercado Espanol"
2. **Indice de contenidos** - Navegacion por anclas a cada seccion
3. **Metodo DCF en profundidad** (~800 palabras) - Explicacion paso a paso con ejemplo numerico real: empresa industrial espanola con facturacion de 5M, proyeccion a 5 anos, calculo del WACC, valor terminal. Tabla con numeros concretos.
4. **Metodo de Multiplos** (~800 palabras) - Tabla de multiplos EV/EBITDA por sector en Espana (2024-2025): Tecnologia 8-15x, Salud 7-10x, Seguridad 6-9x, Industrial 4-7x, Construccion 3-6x. Ejemplo: empresa de servicios profesionales con EBITDA 800K.
5. **Transacciones Comparables** (~600 palabras) - Ejemplo con datos de mercado espanol, fuentes de informacion (Registro Mercantil, TTR, Capital IQ), como ajustar por tamano y geografia.
6. **Valoracion Patrimonial** (~400 palabras) - Cuando usar, ejemplo de holding inmobiliario, diferencia entre valor contable y valor de mercado.
7. **Comparativa de metodos** (~300 palabras) - Tabla resumen con cuando usar cada metodo, precision esperada y coste.
8. **Errores comunes** (~400 palabras) - 8 errores frecuentes en valoraciones de PYMEs espanolas con consecuencias reales.
9. **FAQ ampliado** (~600 palabras) - 8 preguntas orientadas a queries de IA, diferentes a las de /valoracion-empresas.
10. **CTA dual** - Calculadora gratuita + Contacto profesional.

### Componentes reutilizados

Se usaran los componentes existentes de `search-funds-guides/`:
- `GuideSection` para secciones con iconos
- `GuideTip` para callouts de informacion/advertencia
- `GuideChecklist` para listas de verificacion
- `GuideCTA` para llamadas a la accion

Ademas: `SEOHead`, `Header`, `Footer`, `Accordion` (FAQ).

## Structured Data

- **Article** (schema.org): Guia como articulo educativo con autor, fecha, editorial
- **FAQPage**: 8 preguntas frecuentes
- **HowTo**: "Como elegir el metodo de valoracion adecuado" con pasos
- Interlink con `/valoracion-empresas` y `/lp/calculadora`

## Detalle Tecnico

### Archivos a crear/modificar

1. **`src/pages/GuiaValoracionEmpresas.tsx`** (NUEVO) - Pagina completa con todo el contenido, structured data y SEO
2. **`src/core/routing/AppRoutes.tsx`** - Anadir lazy import y ruta `/guia-valoracion-empresas`
3. **`supabase/functions/pages-ssr/index.ts`** - Anadir metadata SSR para la nueva ruta con structured data Article + FAQ + HowTo
4. **`src/utils/seo/schemas.ts`** - Anadir `getArticleSchema()` para contenido tipo guia educativa

### Ruta

```
/guia-valoracion-empresas
```

### Layout

Usara `Header` + `Footer` directamente (mismo patron que `ValoracionEmpresas.tsx`), con contenido en `max-w-4xl` para lectura optima del contenido largo.
