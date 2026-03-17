

## Plan: Filtro multi-provincia clickable en columna

### Cambios en `ContactListDetailPage.tsx`

**1. Estado: de string a string[]**
- Cambiar `filterProvincia` de `useState<string>('all')` a `useState<string[]>([])`
- Array vacío = sin filtro (todas)

**2. Filtrado multi-provincia**
- Actualizar la lógica de filtrado: si `filterProvincias.length > 0`, filtrar con `.includes(c.provincia)`

**3. Click directo en la celda de provincia**
- En el `case 'provincia'` del render de celdas (~línea 1034), convertir el texto en un botón/badge clickable
- Al hacer click, toggle esa provincia en el array de filtros (añadir si no está, quitar si ya está)
- Estilo visual: cursor pointer, hover highlight, y si está activa en el filtro mostrar un badge con color

**4. Barra de filtros: badges de provincias activas**
- Reemplazar el `<Select>` actual de provincia por una zona de badges que muestre las provincias seleccionadas con un botón X para quitar cada una
- Botón "Limpiar provincias" si hay alguna activa

**5. Ajustes derivados**
- Actualizar la condición de "hay filtros activos" para usar `filterProvincias.length > 0`
- Actualizar el reset de página (useEffect) con la nueva variable
- Actualizar el contador "X de Y"

### Resultado
- Click en cualquier provincia de la tabla la añade/quita como filtro
- Se pueden acumular múltiples provincias
- Badges visibles en la barra de filtros para saber qué hay activo y poder quitar individualmente

