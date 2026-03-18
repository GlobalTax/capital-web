

## Plan: Añadir botón "Generar Presentación" en la lista de operaciones

### Contexto
El botón ya existe en la vista de detalle (`OperationDetails.tsx`), pero el usuario quiere tenerlo también en la página principal `/admin/operations` (`AdminOperations.tsx`). Ya existe un sistema de selección múltiple con checkboxes y un `selectedOperations` Set.

### Enfoque
Añadir el botón en la barra de header (junto a Dashboard, Vista Kanban, etc.). Al hacer clic:
- Si hay una operación seleccionada (checkbox), abre el modal para esa operación.
- Si hay múltiples seleccionadas, genera para la primera y avisa.
- Si no hay ninguna seleccionada, muestra un toast pidiendo seleccionar una.

### Cambios en `src/pages/admin/AdminOperations.tsx`

1. **Importar** `GeneratePresentationModal` desde `@/features/operations-management/components/GeneratePresentationModal`
2. **Añadir estado** `showPresentationModal` (boolean) y `presentationOperation` (Operation | null)
3. **Añadir botón** en la zona del header (líneas ~1119-1131, junto a "Extraer"):
   - Icono `FileText`, texto "Generar Presentación"
   - Estilo: `border-[#161B22]/20 hover:bg-[#161B22]/5 text-[#161B22]`
   - onClick: si `selectedOperations.size === 1`, abre modal con esa operación; si size > 1, usa la primera; si size === 0, toast "Selecciona una operación"
4. **Renderizar modal** al final del componente, pasándole `presentationOperation`

### Sin otros cambios
El modal y la utilidad `generatePptx.ts` ya están creados y funcionan. Solo se necesita conectarlos a esta página.

