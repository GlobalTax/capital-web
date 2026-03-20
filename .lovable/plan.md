

## Reemplazar filtro de sector por filtro de Lista Madre en diálogos Mover/Copiar

### Problema
El selector muestra sectores, pero el usuario quiere filtrar por Lista Madre para ver las sublistas vinculadas a cada madre.

### Cambios en `src/pages/admin/ContactListDetailPage.tsx`

**1. Ampliar query `allLists` (línea 727)**
- Añadir `lista_madre_id` al select: `'id, name, sector, lista_madre_id'`

**2. Reemplazar `uniqueSectors` por `uniqueMadres`**
- Computar un array de madres únicas a partir de `allLists`: extraer los `lista_madre_id` distintos, buscar su nombre en `allLists`, y generar `{ id, name }[]`.

**3. Renombrar estados de filtro**
- `moveCopySectorFilter` → filtrará por `lista_madre_id` en vez de sector.
- La UI del Combobox mostrará nombres de listas madre en vez de sectores.
- Pre-selección: usar `list?.lista_madre_id` (la madre de la lista actual) al abrir el diálogo.

**4. Filtrado de listas destino (líneas 2841-2843)**
- Cambiar `.filter((l: any) => !moveCopySectorFilter || l.sector === moveCopySectorFilter)` por `.filter((l: any) => !moveCopySectorFilter || l.lista_madre_id === moveCopySectorFilter)`.

**5. Aplicar lo mismo al diálogo bulk (líneas 2959-2960)**
- Misma lógica de filtro por `lista_madre_id`.

**6. Mostrar sector como info secundaria**
- En cada `CommandItem` de lista destino, mostrar el sector como texto secundario para contexto adicional.

### Resultado
Al abrir "Mover/Copiar", el selector mostrará las Listas Madre disponibles (pre-seleccionando la madre de la lista actual). Las listas destino se filtrarán mostrando solo las sublistas de esa madre.

