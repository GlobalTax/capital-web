

## Plan: Cambiar sublista de empresa bloqueada en lista madre

### Problema
En las listas madre, las empresas asignadas a sublistas están bloqueadas y solo tienen la opción "Ver en sublista". El usuario necesita poder reasignarlas a otra sublista directamente.

### Solución
Añadir la opción **"Cambiar de sublista"** en el menú contextual de empresas bloqueadas (junto a "Ver en sublista"). Al hacer clic, abre el mismo diálogo de mover/copiar pero en modo `move`, pre-filtrando solo las sublistas hermanas como destinos válidos.

### Cambios

**Archivo: `src/pages/admin/ContactListDetailPage.tsx`**

1. **Menú de empresa bloqueada** (líneas 1360-1373): Añadir un segundo `DropdownMenuItem` "Cambiar de sublista" que:
   - Busca el `list_id` actual de la empresa en la sublista (usando `sublistCompanyMap`)
   - Llama a `setMoveCopyCompany(company)` + `setMoveCopyMode('move')` + marca que el origen es una sublista (no la madre)

2. **Nuevo estado**: `moveCopyFromSublistId` — guarda el `list_id` de la sublista origen cuando se mueve desde una empresa bloqueada. Necesario porque `executeMoveCopy` usa `listId` (la madre) como origen del move, pero aquí el registro está en la sublista.

3. **Ajuste en `executeMoveCopy`** (línea ~790): Cuando `moveCopyFromSublistId` está definido, usar ese ID en lugar de `listId` para el `update`:
   ```
   .eq('list_id', moveCopyFromSublistId || listId)
   ```

4. **Filtrar destinos en el diálogo**: Cuando `moveCopyFromSublistId` está definido, mostrar solo las sublistas de esta madre (excluyendo la de origen) como opciones de destino.

5. **Limpiar estado**: Resetear `moveCopyFromSublistId` junto con el resto del estado en el cleanup.

### Flujo
```text
Empresa bloqueada → ⋮ → "Cambiar de sublista"
  → Diálogo con sublistas disponibles (sin la actual)
  → Confirmar → UPDATE list_id del registro → Invalidar cache
```

Un solo archivo editado. Sin cambios de base de datos.

