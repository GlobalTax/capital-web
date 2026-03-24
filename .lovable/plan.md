

## Filtro de Responsable multiselección en el Pipeline

### Problema
El filtro "Asignado" (Responsable) usa un `Select` de selección única, mientras que Canal y Formulario ya permiten multiselección. El usuario quiere poder filtrar por varios responsables a la vez.

### Cambios

**`src/features/leads-pipeline/components/LeadsPipelineView.tsx`**

1. **Estado**: Cambiar `filterAssignee: string` (`'all'`) → `filterAssignees: string[]` (array vacío = todos)
   - El valor especial `'unassigned'` se mantiene como opción seleccionable dentro del array

2. **UI**: Reemplazar el `<Select>` (líneas 396-410) por un `<Popover>` con checkboxes, idéntico al patrón de Canal/Formulario:
   - Checkbox "Sin asignar" + checkbox por cada admin
   - Botón muestra "Asignado (N)" cuando hay selección
   - Botón "Limpiar" dentro del popover

3. **Lógica de filtrado** (líneas 191-196): Adaptar:
   ```
   if (filterAssignees.length > 0) {
     columnLeads = columnLeads.filter(lead => {
       if (filterAssignees.includes('unassigned')) return !lead.assigned_to || filterAssignees.includes(lead.assigned_to);
       return lead.assigned_to && filterAssignees.includes(lead.assigned_to);
     });
   }
   ```

4. **`hasActiveFilters` / `clearFilters`**: Cambiar `filterAssignee !== 'all'` → `filterAssignees.length > 0`

5. **Vistas guardadas**: Actualizar `PipelineViewFilters` en `usePipelineSavedViews.ts` para que `filterAssignee` sea `string[]` en vez de `string`. Añadir retrocompatibilidad para vistas guardadas antiguas (convertir string a array).

6. **`getCurrentFilters` / `handleLoadView`**: Adaptar para el nuevo formato array

