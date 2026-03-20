

## Hacer visible la columna "Descripción" en la tabla de listados

### Diagnóstico
La columna ya tiene datos: **13.583 de 13.696 empresas** en esta lista tienen `descripcion_actividad` relleno. El problema es puramente de UI — el `localStorage` guarda las preferencias de columnas por lista, y las preferencias guardadas para esta lista concreta no recogen correctamente la nueva columna, o la sitúan al final (posición 15) donde queda fuera de la pantalla.

Además, la tabla `empresas` del CRM NO tiene descripciones adicionales que falten (la query cruzada por CIF devuelve 0 resultados), así que no hay datos que sincronizar desde allí.

### Cambios

**1. `src/hooks/useListColumnPreferences.ts`**
- Mover `descripcion_actividad` a una posición más visible en `DEFAULT_COLUMNS` (posición 3, justo después de CIF), para que quede a la vista sin scroll horizontal.
- Añadir un mecanismo de versión al `STORAGE_KEY` (ej: `list-column-prefs-v2`) que fuerce a todos los usuarios a resetear sus preferencias guardadas, asegurando que la nueva columna aparezca en la posición correcta.
- Eliminar el hack de force-visible (ya no será necesario con el reset de versión).

**2. Sincronización automática (futuro)**
- Actualmente los datos ya están en `outbound_list_companies.descripcion_actividad` y no hay datos adicionales en la tabla `empresas` que falten.
- Si en el futuro se suben descripciones a la tabla `empresas`, se puede crear un trigger DB que las propague a `outbound_list_companies` por coincidencia de CIF. Esto se implementaría en un segundo paso si se detectan gaps de datos.

### Resultado
La columna "Descripción" aparecerá en posición prominente (4ª columna) para todos los usuarios, mostrando las descripciones que ya existen en la base de datos.

