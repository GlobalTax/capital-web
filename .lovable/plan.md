

## Plan: Copiar/Mover selección masiva a sublista en Listas de Contacto

### Contexto
Ya existe un diálogo de mover/copiar para empresas individuales (`moveCopyCompany`). Necesitamos reutilizar ese patrón para la selección bulk (84 empresas en el ejemplo).

### Cambios en `ContactListDetailPage.tsx`

**1. Nuevo estado para bulk move/copy:**
- `bulkMoveCopyOpen` (boolean) — controla visibilidad del diálogo
- `bulkMoveCopyMode` ('move' | 'copy') — mover o copiar

**2. Nuevo botón en la barra de selección (línea ~1695):**
Añadir junto a "Eliminar seleccionadas":
- **"Copiar a lista"** (icono `CopyPlus`) — abre diálogo en modo copy
- **"Mover a lista"** (icono `MoveRight`) — abre diálogo en modo move

**3. Nuevo diálogo bulk (o reutilizar el existente):**
Mismo UI que el diálogo individual: selector de lista destino + opción crear nueva. La lógica:
- Obtener las empresas seleccionadas de `companies` filtrando por `selectedIds`
- Si modo **copiar**: insertar todas en la lista destino (batch de 50), dedup por CIF
- Si modo **mover**: actualizar `list_id` en batch
- Toast con resumen (X copiadas/movidas, Y duplicadas omitidas)
- Limpiar selección al terminar

### Archivo

| Archivo | Cambio |
|---------|--------|
| `src/pages/admin/ContactListDetailPage.tsx` | +estado, +botones en barra bulk, +diálogo bulk, +handler `handleBulkMoveCopy` |

