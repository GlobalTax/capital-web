

## Añadir "Descripción Actividad" como columna configurable en listados

### Problema
El campo `descripcion_actividad` ya existe en la base de datos y ya tiene lógica de renderizado en la tabla (filtrado clickable, exportación, formularios), pero no aparece en el menú de columnas visibles porque falta en el array `DEFAULT_COLUMNS` del hook `useListColumnPreferences.ts`.

### Cambio

**`src/hooks/useListColumnPreferences.ts`**
- Añadir una nueva entrada al array `DEFAULT_COLUMNS`:
  ```
  { key: 'descripcion_actividad', label: 'Descripción', visible: false, position: 15, minWidth: '200px' }
  ```
  Se añade con `visible: false` por defecto para no alterar la vista actual de usuarios existentes, pero aparecerá en el configurador de columnas para activarla.

Eso es todo. El renderizado de la celda ya está implementado (case `descripcion_actividad` en `renderCell`), los filtros multi-selección ya lo soportan, y la exportación Excel ya lo incluye.

**Nota**: Los usuarios que ya tienen preferencias guardadas en localStorage recibirán la nueva columna automáticamente gracias a la lógica de merge existente (líneas 59-64 del hook).

