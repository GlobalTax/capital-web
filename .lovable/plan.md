

## Filtro por palabras clave en "Descripción de Actividad"

### Problema
El filtro actual de `descripcion_actividad` funciona igual que el de Provincia o CNAE: lista valores únicos exactos. Como cada descripción es prácticamente única, seleccionar una opción solo muestra 1 empresa. El usuario necesita buscar por **palabras clave** (ej: "peluquería") y filtrar todas las empresas cuya descripción contenga esa palabra.

### Solución
Cambiar el comportamiento del filtro de `descripcion_actividad` de "multi-select exacto" a "búsqueda por texto contenido" (contains/includes).

### Cambios en `src/pages/admin/ContactListDetailPage.tsx`

**1. Separar `descripcion_actividad` de TEXT_FILTER_COLUMNS**
- Excluir `descripcion_actividad` de la lista `TEXT_FILTER_COLUMNS` (que usa match exacto).
- Tratarla como un caso especial en el renderizado del header.

**2. Nuevo header filter para descripción**
- En lugar de listar valores únicos con checkboxes, mostrar un **input de búsqueda de texto libre**.
- Al escribir una palabra (ej: "peluqueria"), filtrar en tiempo real y mostrar un **preview** del número de empresas que coinciden.
- Botón "Aplicar filtro" para confirmar, o aplicación directa al escribir.

**3. Lógica de filtrado (líneas 605-611)**
- Para `descripcion_actividad`, usar `includes` en vez de exact match:
  ```
  if (colKey === 'descripcion_actividad') {
    result = result.filter(c => {
      const val = (c as any)[colKey]?.toLowerCase() || '';
      return selectedValues.some(keyword => val.includes(keyword.toLowerCase()));
    });
  }
  ```
- Los "selectedValues" para esta columna serán las palabras clave buscadas en vez de valores exactos.

**4. Click en celda de descripción**
- Actualmente al hacer click en una celda de descripción, se añade el valor exacto como filtro. Cambiar para que en vez de eso, abra el popover del header con el texto pre-rellenado, o use la búsqueda de actividad existente (`activitySearchQuery`).

### Resultado
El usuario podrá escribir "peluqueria" y ver todas las empresas cuya descripción contenga esa palabra, en vez de solo la empresa con ese valor exacto.

