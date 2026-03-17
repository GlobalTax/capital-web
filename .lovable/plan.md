

## Plan: Añadir filtro personalizado min/max para columnas numéricas

### Cambio en `ContactListDetailPage.tsx`

**1. Nuevo estado para rangos custom**
- Añadir `customRanges: Record<string, { min: string; max: string }>` para almacenar los inputs de min/max por columna

**2. UI: Inputs min/max en el popover numérico** (líneas ~1275-1293)
- Debajo de los checkboxes de rangos predefinidos, añadir un separador "— Rango personalizado —"
- Dos inputs (Mín / Máx) con `inputMode="numeric"` y un botón "Aplicar"
- Al aplicar, se genera un label tipo `"custom:500000-2000000"` y se añade a `columnFilters[colKey]`

**3. Lógica de filtrado** (líneas ~548-559)
- Al encontrar un `rangeLabel` que empiece por `"custom:"`, parsear min/max del string y aplicar la comparación directamente en lugar de buscar en `NUMERIC_RANGES`

**4. Badge display**
- En la barra de filtros activos, si el label empieza por `"custom:"`, mostrar formateado (ej: "500K€ - 2M€") en vez del raw string

### Resultado
- Los rangos predefinidos siguen funcionando con checkboxes
- Adicionalmente se puede poner un min y/o max libre
- Se pueden combinar rangos predefinidos + rango custom

