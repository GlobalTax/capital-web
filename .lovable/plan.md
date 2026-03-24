

## Filtros multiselección para Canal y Formulario en el Pipeline

### Problema actual
Los filtros de Canal y Formulario usan `DropdownMenu` con selección única (`filterChannel: string | null`, `filterFormDisplay: string | null`). El usuario necesita poder seleccionar varios a la vez.

### Cambios

**`src/features/leads-pipeline/components/LeadsPipelineView.tsx`**

1. **Estado** — Cambiar los estados de filtro:
   - `filterChannel: string | null` → `filterChannels: string[]` (array de IDs)
   - `filterFormDisplay: string | null` → `filterFormDisplays: string[]` (array de display names)

2. **UI Canal (líneas 373-390)** — Reemplazar el `DropdownMenu` por un `Popover` con checkboxes:
   - Cada canal tiene un `Checkbox` que togglea su presencia en el array
   - El botón muestra "Canal" si vacío, o "Canal (N)" si hay selección
   - Botón "Limpiar" dentro del popover

3. **UI Formulario (líneas 392-409)** — Mismo patrón con checkboxes para los `displayNameGroups`

4. **Lógica de filtrado (líneas 160-166)** — Adaptar:
   - `filterChannel` → `filterChannels.length > 0 ? columnLeads.filter(lead => filterChannels.includes(lead.acquisition_channel_id)) : columnLeads`
   - `filterFormIds` → unión de IDs de todos los display names seleccionados

5. **`hasActiveFilters` y `clearFilters`** — Adaptar para arrays vacíos en vez de null

6. **`filterFormIds` memo** — Cambiar para resolver múltiples display names a sus IDs combinados

