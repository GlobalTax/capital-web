

## Fix: Eliminación de duplicados en Listas Madre

### Diagnóstico

Hay dos problemas potenciales:

1. **Agrupación por nombre de empresa en vez de CIF**: La deduplicación actual agrupa por `empresa.trim().toLowerCase()`. Si dos registros tienen el mismo CIF pero nombres ligeramente distintos (mayúsculas, espacios, abreviaturas), no se detectan como duplicados. Y viceversa: empresas con mismo nombre pero diferente CIF se agrupan erróneamente.

2. **Error silencioso en la eliminación**: La función `deleteCompanies.mutateAsync(ids)` usa `.delete().in('id', ids)` en Supabase. Si la operación falla (ej: permisos, constraint), el error se muestra como toast pero la UI ya cerró el modal (`setIsDedupModalOpen(false)`) y mostró el toast de éxito **antes** de que `deleteCompanies.onSuccess` se ejecute. Esto se debe a que `handleDedup` ejecuta `toast.success` inmediatamente después del `await`, sin verificar que realmente se eliminaron filas.

### Cambios en `src/pages/admin/ContactListDetailPage.tsx`

**1. Cambiar agrupación de duplicados de `empresa` a `cif`**
- En `duplicateGroups` (línea 1820), agrupar por `cif.trim().toLowerCase()` en vez de `empresa`.
- Ignorar registros sin CIF (ya que no se pueden deduplicar de forma fiable).

**2. Mejorar el flujo de `handleDedup`**
- Mover el `toast.success` y `setIsDedupModalOpen(false)` al callback de éxito de la mutación, no después del `await`.
- Añadir un `try/catch` para manejar errores explícitamente.
- Añadir estado de loading al botón "Eliminar duplicados" para feedback visual.

**3. Actualizar el modal de dedup**
- Mostrar el CIF como identificador del grupo duplicado (en vez del nombre de empresa).
- Mostrar nombre + CIF de cada empresa dentro del grupo para mayor claridad.

