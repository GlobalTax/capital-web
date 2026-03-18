

## Plan: Marcar relación empresa ↔ sublistado / listado madre

### Análisis del estado actual

He revisado todo el código y **la mayor parte de esta funcionalidad ya existe**:

1. **Lista madre → columna "Sublistas"**: Ya muestra badges con el nombre del sublistado al que pertenece cada empresa (vía `sublistCompanyMap`). Se actualiza correctamente tras copiar.
2. **Sublistado → breadcrumb "Sublista de: X"**: Ya muestra a nivel de lista cuál es la madre, pero no hay indicación por empresa.
3. **Invalidación de caché**: Tras mover/copiar, se invalida `sublist-company-map` correctamente, así que los badges en la madre se actualizan.

### Qué falta

**En los sublistados**: Añadir una columna "Lista Madre" que muestre en cada empresa el nombre de la lista madre a la que pertenece. Aunque el breadcrumb ya lo indica a nivel de lista, tener esta columna refuerza visualmente la relación por empresa.

### Cambios

**1. `src/hooks/useListColumnPreferences.ts`**
- Añadir columna `lista_madre` al array `DEFAULT_COLUMNS` (solo visible en sublistas, igual que `sublistas` solo es visible en listas madre)

**2. `src/pages/admin/ContactListDetailPage.tsx`**
- En el `renderCell`, añadir case `lista_madre`: mostrar un Badge con el nombre de `parentList` (ya disponible via query existente) con enlace a la lista madre
- En `useListColumnPreferences`, filtrar: mostrar `lista_madre` solo cuando `list.lista_madre_id` existe (es sublista), ocultar `sublistas` en ese caso (ya implementado al revés)

### Resultado
- **En lista madre**: columna "Sublistas" con badges indicando en qué sublistado está cada empresa (ya funciona)
- **En sublistado**: nueva columna "Lista Madre" con badge indicando de qué lista madre proviene (nuevo)
- Ambas columnas incluirán enlace clickable para navegar entre madre ↔ sublista

