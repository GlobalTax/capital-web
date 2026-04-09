

## Plan: Corregir actualización parcial de duplicados en importación Excel

### Problema identificado

El bucle de actualización de duplicados (líneas 1084-1119 de `ContactListDetailPage.tsx`) tiene **dos problemas**:

1. **Sin delay entre llamadas**: A diferencia de la inserción (que tiene `DELAY_MS = 150` entre batches), las actualizaciones de duplicados se lanzan una tras otra sin pausa. Con muchos duplicados, Supabase aplica rate limiting (429) y las peticiones empiezan a fallar silenciosamente.

2. **CIF case-sensitive**: La actualización usa `.eq('cif', cif)` donde `cif` está normalizado a mayúsculas, pero si el CIF almacenado tiene otra capitalización, el UPDATE no matchea ninguna fila (0 rows affected) sin dar error.

### Solución

**Archivo:** `src/pages/admin/ContactListDetailPage.tsx` (líneas ~1081-1119)

Cambios en el bucle de actualización de duplicados:

1. **Añadir delay entre actualizaciones** — Procesar en mini-batches de 5 con 150ms de pausa entre cada uno (mismo patrón que las inserciones).

2. **Usar comparación case-insensitive de CIF** — Cambiar `.eq('cif', cif)` a una función SQL `ilike` o normalizar el CIF almacenado. La opción más limpia: usar `.filter('cif', 'ilike', cif)` para que el match sea insensible a mayúsculas/minúsculas.

3. **Verificar filas afectadas** — Usar `.select()` en el update para saber si realmente se actualizó alguna fila, y loggear las que no matchean.

### Código propuesto

```typescript
// 2. Update duplicates if user opted in
if (updateDuplicates && validationResult.duplicadas.length > 0) {
  const UPDATABLE_FIELDS = ['tipo_accionista', 'nombre_accionista', 'notas', 'contacto', 'email', 'linkedin', 'director_ejecutivo', 'telefono', 'web', 'posicion_contacto', 'consolidador', 'cnae', 'descripcion_actividad', 'facturacion', 'ebitda', 'num_trabajadores', 'provincia', 'comunidad_autonoma'];
  const UPDATE_DELAY_MS = 100;
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  
  for (let i = 0; i < validationResult.duplicadas.length; i++) {
    const row = validationResult.duplicadas[i];
    const cif = row.cif;
    if (!cif) continue;

    const updates: Record<string, any> = {};
    for (const field of UPDATABLE_FIELDS) {
      const val = row.data[field];
      if (val != null && val !== '' && val !== undefined) {
        updates[field] = val;
      }
    }

    if (Object.keys(updates).length === 0) continue;

    try {
      const { data: updated, error } = await supabase
        .from('outbound_list_companies' as any)
        .update(updates)
        .eq('list_id', listId)
        .ilike('cif', cif)  // Case-insensitive match
        .select('id');
      
      if (error) {
        console.error(`[Import] Failed to update CIF ${cif}:`, error);
        failedCount++;
      } else if (!updated || updated.length === 0) {
        console.warn(`[Import] No rows matched for CIF ${cif}`);
        failedCount++;
      } else {
        updatedCount++;
      }
    } catch (err) {
      console.error(`[Import] Error updating CIF ${cif}:`, err);
      failedCount++;
    }

    setImportProgress({ done: rowsToInsert.length + i + 1, total: totalOperations });
    
    // Throttle to avoid rate limiting
    if (i % 5 === 4) {
      await delay(UPDATE_DELAY_MS);
    }
  }
}
```

### Resultado
- Las actualizaciones de duplicados no se verán interrumpidas por rate limiting
- CIFs con distinta capitalización serán encontrados correctamente  
- Se reportarán las filas que no pudieron ser actualizadas

