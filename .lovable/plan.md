

## Plan: Dropdown multi-select con buscador en el header de "Provincia"

### Cambio en `ContactListDetailPage.tsx`

**En `renderColumnHeader`** (línea ~1087): cuando `colKey === 'provincia'`, en lugar de devolver solo el label, devolver un `Popover` que al hacer click muestre:

1. **Input de búsqueda** para filtrar provincias por nombre
2. **Lista scrollable** con checkboxes de todas las `uniqueProvincias`, filtrada por el texto de búsqueda
3. **Badge counter** en el header mostrando cuántas provincias están seleccionadas
4. **Botón "Limpiar"** para deseleccionar todas

El click en cada checkbox hará toggle en `filterProvincias`. Se usará `Popover` + `PopoverTrigger` + `PopoverContent` de los componentes UI existentes, con un `Input` para búsqueda y `Checkbox` para cada opción.

### Resultado
- Click en "Provincia" en el header → dropdown con buscador y multi-select
- Las provincias clickables en las celdas siguen funcionando igual
- Los badges de filtro activo en la barra de filtros se mantienen

