

## Plan: Unificar "Mover a lista" y "Copiar a lista" en listas madre

### Concepto

En listas madre, eliminar el botón "Copiar a lista" y dejar solo "Mover a lista", pero hacer que internamente funcione como copia (nunca elimina del origen). Esto simplifica la UI: el usuario ve un solo botón "Mover a lista" que añade la empresa al destino sin quitarla de la madre.

### Cambios en `ContactListDetailPage.tsx`

**1. Menú individual (dropdown por empresa, ~líneas 2094-2101):**
- Eliminar la condición `!isMadreList` del botón "Mover a otra lista" → mostrarlo siempre
- Eliminar el botón "Copiar a otra lista" cuando `isMadreList` (ya no hace falta, "Mover" hará lo mismo)

**2. Barra bulk (selección masiva, ~líneas 1826-1833):**
- Eliminar el botón "Copiar a lista" cuando `isMadreList`
- Eliminar la condición `!isMadreList` del botón "Mover a lista" → mostrarlo siempre

**3. Lógica `executeMoveCopy` (~líneas 1018-1023):**
- Cambiar el guard: en vez de bloquear y mostrar error, forzar silenciosamente `mode = 'copy'` cuando `isMadreList`. Así ejecuta la inserción en destino sin borrar del origen.

**4. Lógica `handleBulkMoveCopy` (~líneas 1159-1162):**
- Mismo cambio: en vez de bloquear, forzar `bulkMoveCopyMode` a `'copy'` internamente cuando `isMadreList`.

**5. Toast de éxito:**
- Cuando es lista madre y se fuerza copy, mostrar "Empresa añadida a la lista" (no "movida" ni "copiada") para evitar confusión.

### Resultado
- UI simplificada: un solo botón "Mover a lista"
- Protección total: la empresa nunca se elimina de la lista madre
- Sin cambio de comportamiento real, solo de presentación

