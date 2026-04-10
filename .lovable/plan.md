

## Plan: Alinear estilos de /lp/calculadora-asesorias con /lp/calculadora-asesores

### Problema
La página `/lp/calculadora-asesorias` usa estilos inline completamente personalizados (Playfair Display, DM Sans, palette navy/gold, inputs HTML nativos), mientras que `/lp/calculadora-asesores` usa el sistema de diseño estándar de Capittal (shadcn/ui: Card, Button, Input, Label, Select + UnifiedLayout + Tailwind classes).

### Cambios en `src/pages/LandingCalculadoraAsesorias.tsx`

**1. Envolver en UnifiedLayout + I18nProvider**
- Importar `UnifiedLayout`, `I18nProvider`, `Badge`, `Toaster`
- Reemplazar los componentes custom `Header` y footer por `UnifiedLayout variant="landing"`
- Eliminar la constante `ff` (fuentes custom) y `C` (palette custom)

**2. Reemplazar componentes custom por shadcn/ui**
- `inputStyle` / `<input style={...}>` → `<Input>` de shadcn/ui
- `selectStyle` / `<select style={...}>` → `<Select>` de shadcn/ui
- `FieldLabel` custom → `<Label>` de shadcn/ui
- Botones inline → `<Button>` de shadcn/ui
- Contenedores con inline styles → `<Card>` de shadcn/ui + Tailwind classes
- Service/growth chips → usar Button variant="outline" con toggle

**3. Actualizar Hero y Stepper**
- Hero: usar clases Tailwind estándar (`bg-primary`, `text-primary-foreground`, etc.) en lugar de inline styles
- Stepper: mantener estructura pero con clases Tailwind
- StatsBanner: usar Card components

**4. Actualizar StepOne (formulario)**
- Grid layout con `Card className="p-6 max-w-3xl mx-auto"` como en AdvisorStepperForm
- Secciones separadas con `<h3 className="text-lg font-semibold mb-4">` + `border-t pt-6`
- Inputs con shadcn/ui Input + Label
- Slider de recurrencia con Tailwind classes

**5. Actualizar StepTwo (resultados)**
- Cards de resultados con shadcn/ui Card
- Mantener la lógica de valoración y PDF intacta
- Usar Badge para tags y estados

**6. Actualizar StepThree (confirmación)**
- Card con shadcn/ui + Button

**7. Mantener intacto**
- Toda la lógica de cálculo (`compute`)
- La generación de PDF (`generatePDF`)
- El envío de webhook
- El formulario de contacto y validaciones

### Archivos modificados
- `src/pages/LandingCalculadoraAsesorias.tsx` — refactor completo de estilos (lógica sin cambios)

### Nota
El archivo tiene 1552 líneas. El refactor cambiará los estilos visuales pero preservará toda la lógica de negocio, el cálculo de valoración, la generación de PDF, y el webhook.

