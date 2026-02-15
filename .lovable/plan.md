

## Nueva pagina SEO: /valoracion-empresas

### Resumen

Crear una pagina de contenido SEO en `/valoracion-empresas` con estructura informativa completa sobre valoracion de empresas, incluyendo metodos de valoracion, CTA a la calculadora y a contacto, FAQ con JSON-LD, y anadirla a la navegacion bajo Servicios.

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ValoracionEmpresas.tsx` | **Nuevo** - Pagina principal con todo el contenido |
| `src/core/routing/AppRoutes.tsx` | Anadir ruta `/valoracion-empresas` |
| `src/components/header/data/serviciosData.ts` | Anadir item "Valoracion de Empresas" al submenu de Servicios Principales |
| `supabase/functions/pages-ssr/index.ts` | Anadir contenido SSR para `/valoracion-empresas` |

### Estructura de la pagina

La pagina usa el patron existente: `Header` + secciones + `Footer`, con `SEOHead` para meta tags y structured data.

**Seccion 1 - Hero/Intro:**
- H1: "Valoracion de Empresas: Guia Completa y Herramientas"
- Parrafo introductorio explicando que es la valoracion de empresas y por que es importante
- Fondo limpio, tipografia grande

**Seccion 2 - Metodos de valoracion (cards con iconos):**
- H2: "Metodos de Valoracion"
- 4 tarjetas en grid 2x2 (md:grid-cols-2):
  - **Descuento de flujos de caja (DCF)** - icono `TrendingUp` - descripcion 2-3 frases
  - **Multiplos de mercado (EV/EBITDA, EV/Revenue)** - icono `BarChart3` - descripcion 2-3 frases
  - **Valoracion por activos** - icono `Building` - descripcion 2-3 frases
  - **Transacciones comparables** - icono `Scale` - descripcion 2-3 frases
- Cada tarjeta: borde gris, padding, icono a la izquierda o arriba, titulo en negrita, descripcion debajo

**Seccion 3 - Banner calculadora:**
- H2: "Calcula el valor de tu empresa"
- Texto breve invitando a usar la herramienta
- CTA: "Usar calculadora gratuita" con flecha, enlazando a `/lp/calculadora`
- Fondo de contraste suave (slate-50 o similar)

**Seccion 4 - CTA profesional:**
- H2: "Necesitas una valoracion profesional?"
- Texto: "Nuestra calculadora da una estimacion inicial. Para una valoracion formal con informe detallado, contacta con nuestro equipo."
- Boton "Solicita una valoracion profesional" enlazando a `/contacto`

**Seccion 5 - FAQ accordion:**
- H2: "Preguntas frecuentes sobre valoracion de empresas"
- 5 preguntas con respuestas usando `Accordion` de shadcn/ui:
  1. Es gratuita la calculadora de valoracion?
  2. Que metodos de valoracion utilizais?
  3. Cuanto tarda una valoracion profesional?
  4. Los datos que introduzco son confidenciales?
  5. Que sectores cubre la calculadora?

### SEO

- **Title**: "Valoracion de Empresas | Metodos, Herramientas y Asesoramiento - Capittal"
- **Description**: "Todo sobre valoracion de empresas: metodos DCF, multiplos, comparables. Usa nuestra calculadora gratuita o solicita una valoracion profesional."
- **Canonical**: `https://capittal.es/valoracion-empresas`
- **Structured Data**: `WebPage` schema + `FAQPage` schema (JSON-LD) usando `getWebPageSchema` y `getFAQSchema` ya existentes en `src/utils/seo/schemas.ts`

### Navegacion

Anadir al array "Servicios Principales" en `serviciosData.ts`:
```
{
  id: "valoracion-empresas",
  label: "Valoracion de Empresas",
  href: "/valoracion-empresas",
  icon: 'bar-chart',
  description: "Guia completa de metodos y herramientas de valoracion"
}
```

Se colocara despues de "Valoraciones" (que apunta a `/servicios/valoraciones`) para diferenciar: "Valoraciones" es el servicio profesional, "Valoracion de Empresas" es la guia/hub SEO.

### Detalles tecnicos

- Componente unico `ValoracionEmpresas.tsx` con todas las secciones inline (no componentes separados, ya que el contenido es estatico y simple)
- Iconos de Lucide: `TrendingUp`, `BarChart3`, `Building`, `Scale`, `ArrowRight`, `Calculator`
- Link component de `react-router-dom` para navegacion interna
- Accordion de `@/components/ui/accordion`
- Lazy loading en `AppRoutes.tsx` siguiendo el patron existente
- SSR: anadir entrada completa en `pages-ssr` con todo el texto y FAQ schema
