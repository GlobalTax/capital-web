

## Plan: Filtros dropdown multi-select en headers de todas las columnas filtrables

### Enfoque

Generalizar el patrón del filtro de Provincia a **todas las columnas relevantes**. Para columnas de texto (provincia, comunidad_autonoma, cnae, etc.) → multi-select con buscador. Para columnas numéricas (facturación, EBITDA, empleados) → filtro por **rangos predefinidos** con checkboxes (ej: "0-1M", "1M-5M", "5M-20M", ">20M").

### Columnas con filtro multi-select (texto)
- **Provincia** (ya existe)
- **Comunidad Autónoma**, **CNAE**, **Descripción actividad**, **Posición contacto**, **Director ejecutivo**

### Columnas con filtro por rangos (numérico)
- **Facturación**: Sin dato, 0-1M, 1M-5M, 5M-20M, 20M-50M, >50M
- **EBITDA**: Sin dato, <0 (negativo), 0-500K, 500K-2M, 2M-5M, >5M
- **Empleados**: Sin dato, 1-10, 11-50, 51-200, 201-500, >500

### Cambios en `ContactListDetailPage.tsx`

**1. Estado generalizado**
- Reemplazar `filterProvincias` + `provinciaHeaderSearch` por un estado genérico:
  - `columnFilters: Record<string, string[]>` — filtros activos por columna
  - `headerSearches: Record<string, string>` — búsqueda dentro del popover por columna
- Funciones helper: `toggleColumnFilter(colKey, value)`, `clearColumnFilter(colKey)`

**2. Unique values por columna (texto)**
- Un solo `useMemo` que calcule `uniqueValues: Record<string, string[]>` para las columnas de texto filtrables

**3. Rangos para columnas numéricas**
- Definir constante `NUMERIC_RANGES` con los rangos predefinidos para facturación, EBITDA y empleados
- Cada rango tiene `label`, `min`, `max` (null = sin límite)

**4. `renderColumnHeader` generalizado**
- Para columnas de texto filtrables: mismo popover que provincia (search + checkboxes de valores únicos)
- Para columnas numéricas: popover con checkboxes de rangos predefinidos
- Ambos muestran badge counter cuando hay filtros activos

**5. `filteredCompanies` actualizado**
- Iterar sobre `columnFilters` y aplicar:
  - Texto: `includes(value)`
  - Numérico: comprobar si el valor cae en alguno de los rangos seleccionados

**6. Celdas clickables** (como provincia)
- Las celdas de las columnas de texto filtrables también serán clickables para toggle rápido

**7. Barra de filtros activos**
- Badges agrupados por columna con botón X individual y "Limpiar todo"

### Resultado
- Cada columna filtrable tiene su dropdown con buscador en el header
- Facturación/EBITDA/Empleados filtran por rangos intuitivos
- Click en celdas de texto para filtro rápido
- Todo integrado con paginación (reset a página 0)

