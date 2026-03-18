

## Plan: Automatizar la relación madre-sublista al mover/copiar empresas

### Problema

Cuando se mueve una empresa desde una lista madre a otra lista existente, el sistema no establece automáticamente el `lista_madre_id` en la lista destino. Solo lo hace al crear una lista **nueva** desde el contexto de una lista madre. Por eso "Categoría Dermatología" no tiene `lista_madre_id` y las columnas no aparecen.

### Solución

Modificar `executeMoveCopy` y `handleBulkMoveCopy` en `ContactListDetailPage.tsx` para que, cuando la lista origen es una lista madre (`isMadreList`), automáticamente se establezca `lista_madre_id = listId` en la lista destino si ésta aún no tiene `lista_madre_id`.

### Cambios en `ContactListDetailPage.tsx`

**1. En `executeMoveCopy` (~línea 1042-1046), después de insertar la copia:**
- Consultar si la lista destino ya tiene `lista_madre_id`
- Si no lo tiene, hacer `UPDATE outbound_lists SET lista_madre_id = [listId actual] WHERE id = [targetId]`
- Invalidar la query `contact-list-detail` del destino para que se actualice

**2. En `handleBulkMoveCopy` (~después de la inserción bulk):**
- Mismo patrón: si `isMadreList` y la lista destino no tiene `lista_madre_id`, establecerlo automáticamente

**3. Invalidación de caché:**
- Tras establecer `lista_madre_id`, invalidar `sublist-company-map` del listId actual para que la columna "Sublistas" se actualice y muestre el nuevo sublistado
- Invalidar `contact-list-detail` del targetId para que si se navega allí, muestre la columna "Lista Madre"

### Resultado
- Al mover empresas desde una lista madre a otra lista, ésta se convierte automáticamente en sublista
- La columna "Sublistas" en la madre y "Lista Madre" en el sublistado aparecerán sin configuración manual

