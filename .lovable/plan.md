

## Filtro por sector en diálogos de Mover/Copiar empresa

### Cambios en `src/pages/admin/ContactListDetailPage.tsx`

**1. Ampliar la query `allLists` (línea ~720)**
- Cambiar `.select('id, name')` → `.select('id, name, sector')` para disponer del sector de cada lista.

**2. Extraer sectores únicos**
- Computar un array de sectores únicos a partir de `allLists` (filtrando nulls).

**3. Añadir estado de filtro por sector**
- Nuevo estado `moveCopySectorFilter` (string, por defecto `''` = todos).

**4. Modificar el diálogo individual de mover/copiar (líneas ~2779-2818)**
- Antes del Popover de selección de lista, insertar un `<Select>` con las opciones: "Todos los sectores" + cada sector único.
- Filtrar `allLists` por sector seleccionado además de por el término de búsqueda existente.
- Mostrar el sector como texto secundario (`text-xs text-muted-foreground`) junto al nombre de cada lista en los `CommandItem`.

**5. Modificar el diálogo bulk de mover/copiar (líneas ~2871-2903)**
- Aplicar el mismo patrón: estado `bulkMoveCopySectorFilter`, Select de sector, y filtrado de `allLists`.

**6. Reset del filtro**
- Al cerrar cualquiera de los dos diálogos, resetear el filtro de sector a `''`.

