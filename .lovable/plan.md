

## Plan: Soporte para +6000 empresas en listados

### Problema raíz
Supabase devuelve como máximo 1000 filas por query por defecto. Cuando un listado supera esa cantidad, solo se cargan las primeras 1000 (o se corta al llegar al límite). Esto afecta a:

1. **Carga de empresas** (`useContactLists.ts` línea 188) — solo trae 1000 empresas
2. **Validación de importación** (`useExcelImportValidation.ts` líneas 51-55) — solo verifica contra 1000 CIFs existentes
3. **Duplicado de lista** (`useContactLists.ts` línea 164) — solo copia 1000 empresas

### Solución: Paginación automática en todas las queries

**Archivo 1: `src/hooks/useContactLists.ts`**

- Crear función helper `fetchAllRows` que pagine automáticamente (1000 en 1000) hasta obtener todos los registros:
```typescript
async function fetchAllRows(query) {
  let allData = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) throw error;
    allData.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allData;
}
```
- Aplicar en la query de `useContactListCompanies` (línea 188)
- Aplicar en `duplicateList` (línea 164) — también insertar las copias en batches

**Archivo 2: `src/hooks/useExcelImportValidation.ts`**

- Aplicar paginación al fetch de CIFs existentes en la lista (línea 51-55)
- Aplicar paginación al fetch de CIFs de empresas (línea 59-62)
- Aplicar paginación a los fetches de sublistas hermanas y parent

**Archivo 3: `src/pages/admin/ContactListDetailPage.tsx`**

- Aumentar batch size del insert de 25 a 100 para acelerar importaciones grandes
- (El insert ya pagina correctamente, solo es lento con batches de 25)

### Resultado
- Listas de cualquier tamaño se cargan completas
- La validación de importación verifica contra todos los CIFs existentes
- La importación masiva es más rápida con batches de 100

