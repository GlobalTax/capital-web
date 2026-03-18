

## Análisis: Ya está implementado (casi todo)

He revisado exhaustivamente el código y las restricciones para listas madre **ya están aplicadas**:

- **Botón "Mover a lista"** (individual y bulk): oculto con `!isMadreList` ✅
- **Botón "Eliminar"** (individual y bulk): oculto con `!isMadreList` ✅
- **`handleDeleteSelected`**: tiene guard que muestra warning y retorna si `isMadreList` ✅
- **"Copiar a lista"**: correctamente disponible y usa modo `copy` ✅
- **"Cambiar de sublista"**: solo reasigna entre sublistas, no elimina de la madre ✅

### Mejoras de seguridad adicionales (defense-in-depth)

Hay 2 puntos sin proteger que conviene blindar:

| Archivo | Cambio |
|---------|--------|
| `ContactListDetailPage.tsx` | Añadir guard `isMadreList` en `executeMoveCopy`: si `moveCopyMode === 'move'` y `isMadreList` y NO es reasignación de sublista → bloquear y mostrar toast |
| `ContactListDetailPage.tsx` | Añadir guard `isMadreList` en `handleBulkMoveCopy`: si `bulkMoveCopyMode === 'move'` y `isMadreList` → bloquear y mostrar toast |
| `ContactListDetailPage.tsx` | Añadir guard `isMadreList` en `handleDedup`: las listas madre NO deberían permitir eliminar duplicados (ya que implica borrar registros) |

Estos guards son redundantes con la UI, pero protegen contra cualquier bypass accidental.

