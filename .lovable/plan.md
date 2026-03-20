

## Generar catálogo ROD en inglés

### Resumen
Añadir un selector de idioma (ES/EN) al modal de generación del catálogo ROD, para que al elegir inglés se traduzcan automáticamente todos los textos estáticos del catálogo y se usen los campos `_en` de las operaciones ya disponibles en la base de datos.

### Cambios

**1. `src/features/operations-management/types/operations.ts`**
- Añadir campos opcionales: `description_en`, `short_description_en`, `highlights_en`

**2. `src/features/operations-management/utils/generateDealhubPptx.ts`**
- Crear un mapa de traducciones ES/EN para los textos estáticos del catálogo (secciones, labels, etc.):
  - `DEALHUB_SECTIONS`: versión EN de labels/subtitles (`Sale Mandates`, `Preparation Phase`, `Acquisition Mandates`, `In Exclusivity`)
  - Textos en slides: `Aspectos Destacados` → `Key Highlights`, `Resumen` → `Summary`, `Datos Clave` → `Key Data`, `Ubicación` → `Location`, `Sector`, `Oportunidad` → `Opportunity`, `Facturación` → `Revenue`, `EBITDA`, `Margen EBITDA` → `EBITDA Margin`, `Empleados` → `Employees`, `Más Información` → `More Information`, `Índice de Oportunidades` → `Investment Opportunities Index`, `operaciones` → `operations`, `Gracias` → `Thank You`
- Añadir parámetro `locale?: 'es' | 'en'` a `generateDealhubPptx()` y propagarlo a todas las funciones de slides
- En `addOperationSlide`, usar `op.description_en || op.description`, `op.short_description_en || op.short_description`, `op.highlights_en || op.highlights` cuando el locale sea `'en'`
- En todas las funciones de slide, seleccionar el texto del mapa de traducciones según el locale

**3. `src/features/operations-management/utils/generateDealhubPdf.tsx`**
- Mismos cambios: parámetro `locale`, mapa de traducciones, uso de campos `_en` para el contenido de operaciones

**4. `src/features/operations-management/hooks/useKanbanOperations.ts`**
- Asegurar que el `select('*')` ya trae los campos `_en` (sí, porque usa `*`)

**5. `src/features/operations-management/components/GenerateDealhubModal.tsx`**
- Añadir estado `locale` (`'es' | 'en'`, default `'es'`)
- Añadir un selector de idioma (ES / EN) junto al selector de formato PPTX/PDF en el footer
- Pasar `locale` a `generateDealhubPptx()` y `generateDealhubPdf()`
- Cambiar nombre del archivo: `Capittal_Dealhub_EN_Q1_2025.pptx` cuando sea inglés

### Lo que NO se toca
- La Edge Function `merge-pptx` no necesita cambios (solo maneja la fusión de archivos)
- Los templates PPTX estáticos subidos se mantienen igual
- El flujo existente en español sigue funcionando exactamente igual (locale por defecto = `'es'`)

