

## Plan: Paginación client-side para listas grandes (+10K)

### Problema
La tabla renderiza las 10.000+ filas de golpe con `.map()`, lo que bloquea el navegador. Los datos ya se cargan bien (con `fetchAllRows` paginado desde Supabase), pero el **render** es el cuello de botella.

### Solución: Paginación client-side con 100 filas por página

La virtualización (react-window) no es viable aquí porque la tabla tiene filas con contenido variable (inline editing, separadores, dropdowns). La paginación es más simple y compatible con la UI existente.

### Cambios en `ContactListDetailPage.tsx`

1. **Nuevos estados**: `currentPage` (number), `PAGE_SIZE = 100`
2. **Slice de datos**: En lugar de `filteredCompanies.map(...)`, usar `filteredCompanies.slice(startIndex, endIndex).map(...)`
3. **Controles de paginación**: Componente al pie de la tabla con:
   - Botones Anterior / Siguiente
   - Indicador "Página X de Y" y "Mostrando 1-100 de 10.215"
   - Selector de filas por página (50 / 100 / 250 / 500)
4. **Reset de página**: Resetear `currentPage = 0` cuando cambian filtros, búsqueda o sort
5. **Select all**: Ajustar `handleSelectAll` para que seleccione solo la página visible o todas (con confirmación)

### Archivo a modificar
- `src/pages/admin/ContactListDetailPage.tsx` — añadir paginación al render de la tabla

### Resultado esperado
- Carga instantánea de la tabla (solo 100 DOM nodes en vez de 10K+)
- Navegación fluida entre páginas
- Sin cambios en la lógica de datos ni en la query

