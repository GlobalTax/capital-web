

## Vistas personalizadas en el Pipeline

### Concepto
Permitir guardar combinaciones de filtros con un nombre, y cargarlas con un clic. Persistido en `localStorage` (sin necesidad de tabla en Supabase).

### Cambios

**1. Nuevo hook `src/features/leads-pipeline/hooks/usePipelineSavedViews.ts`**

- Define tipo `PipelineSavedView`: `{ id, name, filters: { searchQuery, filterAssignee, filterChannels, filterFormDisplays, filterDateFrom, filterDateTo, filterRevMin, filterRevMax, filterEbitdaMin, filterEbitdaMax } }`
- CRUD en `localStorage` bajo clave `pipeline-saved-views`
- Funciones: `savedViews`, `saveView(name, filters)`, `deleteView(id)`, `renameView(id, name)`

**2. Actualizar `LeadsPipelineView.tsx`**

- Importar el hook
- Añadir en la barra de filtros (junto al botón "Limpiar filtros") un componente inline:
  - **Botón "Guardar vista"**: aparece solo cuando hay filtros activos. Abre un pequeño popover con input de nombre + botón guardar
  - **Selector de vistas guardadas**: `DropdownMenu` con las vistas guardadas. Al seleccionar una, aplica todos los filtros. Cada item tiene botón de eliminar (icono X)
- Al cargar una vista: setea todos los estados de filtro de golpe
- Al guardar: captura el estado actual de todos los filtros

### UI

```text
[🔍 Buscar...] [Responsable ▾] [Canal ▾] [Formulario ▾] [Fecha...] [Fact...] [EBITDA...]
[⭐ Mis vistas ▾] [💾 Guardar vista]  [Limpiar filtros]
```

El dropdown "Mis vistas" muestra la lista de vistas guardadas con opción de eliminar cada una.

### Resultado
El usuario puede guardar cualquier combinación de filtros como vista con nombre, cargarla con un clic, y eliminarla cuando ya no la necesite. Todo persiste en localStorage sin cambios en backend.

