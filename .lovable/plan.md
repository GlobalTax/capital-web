

## Plan: Nueva página `/lp/calculadora-asesorias`

### Resumen
Crear una landing page standalone para valoración de asesorías/despachos profesionales, con diseño custom (no reutiliza UnifiedLayout) usando la paleta navy/gold especificada y las fonts Playfair Display, DM Sans y Roboto Mono.

### Archivos a crear/modificar

**1. `index.html`** — Añadir DM Sans a la carga de Google Fonts (Roboto Mono ya se usa vía `font-mono` de Tailwind; DM Sans no está cargada).

**2. `src/pages/LandingCalculadoraAsesorias.tsx`** — Página principal. Componente autocontenido con:
- **Header propio**: Logo "Capittal" (tracking-[2px]) + "M&A · Consulting" en monospace + badge "Herramienta gratuita" con borde gold
- **Hero section**: Fondo #161B22, título en Playfair Display, subtítulo en DM Sans
- **Banner de stats**: 3 tarjetas con "6+", "11.000+", "3-10x" sobre fondo #F3F4F5
- **Stepper visual**: 3 pasos con estado activo/completado/pendiente
- **Paso 1 (formulario)**: Campos agrupados — datos de contacto, datos del despacho, datos financieros. Campos: nombre, email, teléfono, nombre del despacho, tipo de despacho (select), empleados (select), facturación, EBITDA. Sin lógica de envío real, solo estructura visual y navegación de estado.
- **Paso 2 (resultados placeholder)**: Layout de resultados con valores placeholder (0€), CTA "Descargar informe PDF" deshabilitado
- **Footer**: Disclaimer legal + "© Capittal Transacciones"

**3. `src/core/routing/AppRoutes.tsx`** — Añadir lazy import y ruta `/lp/calculadora-asesorias`.

### Detalles de diseño
- Sin usar UnifiedLayout (diseño 100% custom para esta LP)
- Paleta estricta: Navy #161B22, Gold #C5A45A (solo acentos mínimos), grises especificados
- Fonts: Playfair Display para H1/H2, DM Sans para body/inputs, Roboto Mono para labels/overlines/stepper
- Stepper interactivo: click en paso completado vuelve atrás
- Formulario con validación visual básica (required fields marcados)
- Responsive mobile-first
- Sin lógica de cálculo ni envío a Supabase

### Complejidad
Archivo principal ~500-600 líneas (todo en un componente para esta fase). Se podrá modularizar cuando se añada la lógica de cálculo.

