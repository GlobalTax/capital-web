

## Diagnóstico: Los "duplicados" son falsos — causados por paginación no determinista

### Problema raíz

La base de datos **NO tiene duplicados reales** por CIF en esta lista (13,679 registros, todos con CIF único). Sin embargo, la función `fetchAllRows` pagina con `.order('created_at', { ascending: false })` como único criterio de orden. Muchas filas comparten el mismo `created_at` (importaciones por lotes de 5 o 20 registros simultáneos), lo que causa que Supabase devuelva la misma fila en dos páginas diferentes.

Resultado: el array `companies` en el frontend contiene **la misma fila repetida**, el algoritmo de dedup la detecta como "duplicado por CIF" y al eliminar la "copia", **borra el único registro real** de la base de datos.

### Solución

**Archivo: `src/hooks/useContactLists.ts` (línea 216)**

Añadir `.order('id')` como segundo criterio de ordenación para hacer la paginación determinista:

```typescript
supabase.from(TB_COMPANIES).select('*')
  .eq('list_id', listId!)
  .order('created_at', { ascending: false })
  .order('id')  // ← garantiza orden estable entre páginas
  .range(from, to)
```

**Archivo: `src/hooks/useContactLists.ts` (líneas 14-29)**

Añadir deduplicación por `id` como red de seguridad en `fetchAllRows`:

```typescript
async function fetchAllRows<T extends { id?: string }>(
  buildQuery: (from: number, to: number) => any,
  pageSize = 1000
): Promise<T[]> {
  const allData: T[] = [];
  const seenIds = new Set<string>();
  let from = 0;
  while (true) {
    const { data, error } = await buildQuery(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) {
      const id = (row as any).id;
      if (id && seenIds.has(id)) continue;
      if (id) seenIds.add(id);
      allData.push(row);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return allData;
}
```

**Archivo: `src/pages/admin/ContactListDetailPage.tsx` — handleDedup**

Añadir estrategia "más completa" como default y reforzar la deduplicación para que no elimine registros cuando el grupo tiene IDs repetidos:

- Contar campos rellenos por registro para elegir el "más completo"
- Verificar que los IDs a eliminar sean distintos del ID a conservar antes de ejecutar el delete

### Resultado esperado

- Los "falsos duplicados" desaparecen al cargar la lista (paginación correcta)
- Si existieran duplicados reales, se conserva el más completo
- Nunca se eliminará el único registro de un CIF

