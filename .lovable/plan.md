

## Plan: Botón "Generar Presentación" en OperationDetails

### Enfoque
Añadir un botón en el header de la vista de detalle de operación que abre un modal para configurar y generar un `.pptx` descargable, usando `pptxgenjs` (client-side, sin Edge Function adicional).

### Archivos

**1. Crear**: `src/features/operations-management/components/GeneratePresentationModal.tsx`
- Modal con las especificaciones exactas de diseño (colores, tipografía, radii indicados)
- Checklist de 7 secciones (Portada, Resumen Ejecutivo, La Empresa, Financieros, Tesis de Inversión, Proceso M&A, Contacto) — todas checked por defecto
- Selector tipo pill/tab para Teaser / CIM / Pitch Deck
- Botón "Generar y Descargar" con estado de loading (spinner + disabled)
- Botón "Cancelar"
- Recibe la `operation` como prop para inyectar los datos reales en las slides

**2. Crear**: `src/features/operations-management/utils/generatePptx.ts`
- Función que recibe la operación, secciones seleccionadas y tipo de template
- Usa `pptxgenjs` (se instalará como dependencia npm) para generar las slides client-side
- Cada sección se mapea a 1-2 slides con datos de la operación:
  - **Portada**: company_name, sector, deal_type, logo si existe
  - **Resumen Ejecutivo**: short_description, highlights
  - **La Empresa**: description, sector, subsector, employees
  - **Financieros**: revenue, ebitda, ebitda_multiple, growth_percentage, valuation
  - **Tesis de Inversión**: highlights como bullet points
  - **Proceso M&A**: deal_type, status, timeline info
  - **Contacto**: datos de Capittal (estáticos)
- Colores corporativos Capittal (#161B22 navy, white, #F3F4F5)
- Descarga directa con `pres.writeFile({ fileName: 'Presentacion_CompanyName.pptx' })`

**3. Modificar**: `src/pages/admin/OperationDetails.tsx`
- Importar `GeneratePresentationModal`
- Añadir estado `showPresentationModal`
- Añadir botón `FileText` icon + "Generar Presentación" en línea 289-306 (zona de acciones del header), junto al selector de status
- Renderizar el modal al final del componente

### Dependencia nueva
- Instalar `pptxgenjs` — librería client-side que genera .pptx sin servidor, ~300KB, ampliamente usada

### Sin cambios en backend
No se necesitan Edge Functions ni migraciones. Todo se genera client-side con los datos ya cargados en `operation`.

