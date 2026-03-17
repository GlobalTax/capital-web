

## Plan: Seleccionar todas las empresas filtradas (no solo la página actual)

### Problema
`handleSelectAll` solo selecciona `paginatedCompanies` (la página actual, máx 100). Cuando hay filtros activos con más resultados, no se pueden seleccionar todos.

### Solución
Añadir un banner informativo (patrón Gmail/Google Sheets) que aparezca cuando se selecciona toda la página y hay más empresas filtradas disponibles.

**Flujo:**
1. Usuario marca el checkbox del header → selecciona las ~100 de la página actual (comportamiento actual).
2. Si `filteredCompanies.length > paginatedCompanies.length`, aparece un banner: _"Has seleccionado {pageSize} empresas de esta página. **Seleccionar las {filteredCompanies.length} empresas del filtro actual**"_.
3. Al hacer click, `setSelectedIds(filteredCompanies.map(c => c.id))` selecciona todas las filtradas.
4. El banner cambia a: _"{total} empresas seleccionadas. **Borrar selección**"_.

### Cambios en un solo archivo

**`src/pages/admin/ContactListDetailPage.tsx`:**
- Modificar `handleSelectAll`: sin cambios en la lógica base (sigue seleccionando la página).
- Añadir función `handleSelectAllFiltered`: selecciona todos los IDs de `filteredCompanies`.
- Añadir banner condicional entre la barra de acciones bulk y la tabla: visible cuando todos los de la página están seleccionados Y `filteredCompanies.length > pageSize`.
- El banner tiene un link/botón para `handleSelectAllFiltered` y otro para limpiar selección.

