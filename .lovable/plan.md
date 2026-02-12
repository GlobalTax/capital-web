

## Plan: 6 Mejoras UX para Valoraciones Pro

### 1. Inputs financieros con formato de miles visual

**Archivo a modificar:** `src/components/admin/professional-valuations/steps/FinancialDataStep.tsx`

Reutilizar el componente `CurrencyInput` que ya existe en `src/components/ui/currency-input.tsx`. Este componente ya hace exactamente lo pedido: muestra separador de miles, gestiona estado local de texto vs numero, y pasa el valor numerico puro al `onChange`.

Cambios:
- Importar `CurrencyInput` de `@/components/ui/currency-input`
- Reemplazar los `<Input type="number">` de Facturacion (linea 137-146) y EBITDA (linea 166-175) por `<CurrencyInput>`
- Adaptar el `onChange`: en vez de `parseFloat(e.target.value)`, pasar directamente el valor numerico que devuelve `CurrencyInput`
- Eliminar los `<p>` con `formatCurrencyEUR` debajo de cada input, ya que el propio `CurrencyInput` muestra el formato

### 2. Indicador visual de completitud en el stepper

**Archivo a modificar:** `src/components/admin/professional-valuations/ProfessionalValuationForm.tsx`

Cambios en el bloque del stepper (lineas 376-418):
- Importar `CheckCircle2` de lucide-react (ya esta importado pero no usado en el stepper)
- En el circulo de pasos completados (`isCompleted`): reemplazar `<Icon>` por `<CheckCircle2>` 
- En pasos no activos y no completados: si `isStepValid(step.id)` es true, anadir un dot verde (div absoluto 8x8px) en esquina superior derecha del circulo, y borde punteado verde
- Debajo del titulo de cada paso (no activo): mostrar texto "Completo" en verde si `isStepValid(step.id)`, o "Pendiente" en gris si no

### 3. Matriz de sensibilidad en el paso de Multiplos

**Archivo a modificar:** `src/components/admin/professional-valuations/steps/MultiplesStep.tsx`

Cambios (despues del bloque "Resultado de la Valoracion", linea ~420):
- Importar `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` de `@/components/ui/collapsible`
- Importar `ChevronDown` de lucide-react
- Anadir un bloque condicional: si `calculatedValues?.sensitivityMatrix` existe, renderizar un `<Card>` con `<Collapsible>` (defaultOpen=false)
- El trigger muestra "Analisis de Sensibilidad" con icono de chevron que rota
- El contenido replica la tabla de `PreviewStep.tsx` (lineas 171-202), con la logica de resaltar la celda correspondiente al multiplo seleccionado actual
- Para resaltar: comparar cada multiplo de la matriz con `multipleUsed` y marcar el mas cercano con `bg-primary/10 font-bold`

### 4. Modo edicion rapida (Sheet lateral)

**Archivo nuevo:** `src/components/admin/professional-valuations/QuickEditSheet.tsx`
**Archivo a modificar:** `src/components/admin/professional-valuations/ProfessionalValuationForm.tsx`

Nuevo componente `QuickEditSheet`:
- Props: `open`, `onOpenChange`, `data: ProfessionalValuationData`, `calculatedValues`, `updateField`, `onSave`, `onGeneratePdf`, `isSaving`, `isGenerating`
- Usa `Sheet` de shadcn (side="right", className ancho ~50%)
- Contenido:
  - EBITDA normalizado (solo lectura, formateado)
  - Slider + Input del multiplo EBITDA (misma logica que MultiplesStep)
  - Resultado: valoracion baja/central/alta (recalculado con `normalizedEbitda * multipleUsed`)
  - Textareas de Fortalezas y Debilidades
  - Botones: "Guardar" (llama onSave), "Generar PDF" (llama onGeneratePdf), "Cerrar"

Cambios en `ProfessionalValuationForm.tsx`:
- Estado `quickEditOpen` (boolean)
- Boton "Edicion rapida" en la barra de navegacion inferior, visible solo si `initialData?.id` existe
- Renderizar `<QuickEditSheet>` pasando props necesarios

### 5. Tabla estructurada en Comparables

**Archivo a modificar:** `src/components/admin/professional-valuations/steps/ComparableOperationsStep.tsx`

Cambios:
- Anadir estado `showTable` (boolean, default false)
- Anadir un toggle al inicio: "Modo tabla" / "Solo texto libre" usando `Switch`
- Cuando `showTable` es true, renderizar una tabla editable ENCIMA del texto libre:
  - Columnas: Empresa (text), Sector (text), Valor operacion (CurrencyInput), Multiplo EBITDA (number step 0.1), Ano (number)
  - Cada fila tiene boton Trash2 para eliminar
  - Boton "+ Anadir operacion" que crea una fila nueva con `id: crypto.randomUUID()`, `isManual: true`
  - Los datos se leen/escriben en `data.comparableOperations` via `updateField('comparableOperations', [...])`
- El texto libre y boton IA se mantienen debajo, sin cambios

Tipo `ComparableOperation` ya existe con los campos necesarios: `id`, `companyName`, `sector`, `valuationAmount`, `ebitdaMultiple`, `year`, `dealType`, `isManual`.

### 6. Vista previa del PDF en Sheet lateral

**Archivo nuevo:** `src/components/admin/professional-valuations/PdfPreviewPanel.tsx`
**Archivo a modificar:** `src/components/admin/professional-valuations/ProfessionalValuationForm.tsx`

Nuevo componente `PdfPreviewPanel`:
- Props: `open`, `onOpenChange`, `data: ProfessionalValuationData`
- Usa `Sheet` (side="right", ancho ~50%)
- Al abrirse (o al pulsar "Actualizar preview"):
  - Muestra spinner (estado `isRendering`)
  - Importa dinamicamente `ProfessionalValuationPDF` de `@/components/pdf/ProfessionalValuationPDF.tsx`
  - Genera blob con `pdf(<ProfessionalValuationPDF data={data} />).toBlob()`
  - Muestra el blob en `<iframe src={URL.createObjectURL(blob)}>`
  - Boton "Actualizar preview" para regenerar
  - Boton "Descargar" que crea un link temporal y descarga el PDF

Cambios en `ProfessionalValuationForm.tsx`:
- Estado `pdfPreviewOpen` (boolean)
- Boton "Vista previa PDF" con icono `Eye` en la barra de navegacion inferior, visible en cualquier paso
- Renderizar `<PdfPreviewPanel>` pasando `dataWithCalculations`

### Seccion tecnica

**Dependencias**: Todas ya instaladas (`@react-pdf/renderer`, `@radix-ui/react-collapsible`, Radix Sheet via vaul, lucide-react).

**Archivos nuevos (2)**:
- `src/components/admin/professional-valuations/QuickEditSheet.tsx`
- `src/components/admin/professional-valuations/PdfPreviewPanel.tsx`

**Archivos modificados (4)**:
- `src/components/admin/professional-valuations/ProfessionalValuationForm.tsx` (stepper + barra navegacion + estados para sheets)
- `src/components/admin/professional-valuations/steps/FinancialDataStep.tsx` (CurrencyInput)
- `src/components/admin/professional-valuations/steps/MultiplesStep.tsx` (matriz sensibilidad)
- `src/components/admin/professional-valuations/steps/ComparableOperationsStep.tsx` (tabla estructurada)

**Archivos NO tocados**:
- `src/utils/professionalValuationCalculation.ts`
- `src/types/professionalValuation.ts`
- `src/components/pdf/ProfessionalValuationPDF.tsx`
- `src/components/ui/currency-input.tsx` (se reutiliza tal cual)

**Riesgo principal**: La generacion del PDF con `@react-pdf/renderer` en el navegador puede ser lenta para documentos grandes. Se mitiga generando solo bajo demanda (al abrir el panel o pulsar "Actualizar").

