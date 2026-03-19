

## Fix: Columna Sublistas no se actualiza automáticamente al añadir empresa a sublista

### Problema
Cuando se añade una empresa a una sublista (manual, import, move/copy), la columna "Sublistas" en la lista madre no se actualiza porque:
1. El `invalidate()` en `useContactLists.ts` no invalida el cache de `sublist-company-map` de la lista madre
2. Tampoco invalida `contact-list-companies` de la lista madre (que recibe datos del trigger `sync_sublist_company_to_madre`)

### Solución

**1. Ampliar la invalidación en `useContactLists.ts`**
- En la función `invalidate()`, además de invalidar la lista actual, detectar si la lista tiene `lista_madre_id` y también invalidar:
  - `['sublist-company-map', lista_madre_id]` — para que la columna sublistas se recalcule
  - `['contact-list-companies', lista_madre_id]` — para que la empresa sincronizada por el trigger aparezca

Para esto, el hook necesita recibir el `lista_madre_id` como parámetro opcional, o buscarlo en el cache de `contact-list-detail`.

**2. Invalidar `sublist-company-map` en todas las operaciones de la página**
- En `ContactListDetailPage.tsx`, asegurar que tras `handleAddManual`, import Excel, y operaciones bulk, se invalide `sublist-company-map` del madre (usando `list?.lista_madre_id` si estamos en una sublista).

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/hooks/useContactLists.ts` | Aceptar `madreLisId` opcional en `useContactListCompanies`, invalidar cache de madre en todas las mutaciones |
| `src/pages/admin/ContactListDetailPage.tsx` | Invalidar `sublist-company-map` del madre tras add manual, import, y bulk ops cuando estamos en sublista |

### Detalle técnico

```typescript
// useContactLists.ts - invalidate ampliado
const invalidate = () => {
  queryClient.invalidateQueries({ queryKey: ['contact-list-companies', listId] });
  queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
  // Si esta lista es sublista, invalidar cache de la madre
  if (madreListId) {
    queryClient.invalidateQueries({ queryKey: ['sublist-company-map', madreListId] });
    queryClient.invalidateQueries({ queryKey: ['contact-list-companies', madreListId] });
  }
};
```

```typescript
// ContactListDetailPage.tsx - tras handleAddManual, importExcel, etc.
if (list?.lista_madre_id) {
  queryClient.invalidateQueries({ queryKey: ['sublist-company-map', list.lista_madre_id] });
  queryClient.invalidateQueries({ queryKey: ['contact-list-companies', list.lista_madre_id] });
}
```

