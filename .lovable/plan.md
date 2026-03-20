

## Permitir eliminar duplicados en Listas Madre

### Problema
La función `handleDedup` (línea 1833) tiene un guard que bloquea cualquier eliminación en listas madre, incluyendo la eliminación de duplicados. Esto es demasiado restrictivo: la protección de listas madre debería impedir eliminar empresas manualmente, pero sí permitir la deduplicación (que solo elimina copias redundantes del mismo CIF).

### Cambio

**`src/pages/admin/ContactListDetailPage.tsx`** (líneas 1833-1838)
- Eliminar el guard `isMadreList` de `handleDedup`. La deduplicación es segura porque no elimina la empresa del listado, solo las filas duplicadas, manteniendo siempre una copia.

