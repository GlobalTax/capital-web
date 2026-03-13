

## Plan: Añadir tipo "Listado Madre" a las listas de contacto

### Cambios

#### 1. `src/hooks/useContactLists.ts`
- Ampliar `ContactListTipo` a `'compradores' | 'outbound' | 'madre' | 'otros'`

#### 2. `src/pages/admin/ContactListsPage.tsx`
- Añadir entrada en `TIPO_BADGES` para `madre` con estilo diferenciado (púrpura):
  ```ts
  madre: { label: 'Listado Madre', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  ```
- Actualizar tab counts: incluir en "madre" también listas con `tipo === 'madre'` (no solo `has_children`)
- Actualizar filtros de tabs para que `tipo === 'madre'` vaya al tab Madre y se excluya de compradores/outbound

#### 3. `src/pages/admin/ContactListDetailPage.tsx`
- Añadir opción `<SelectItem value="madre">Listado Madre</SelectItem>` en el selector de tipo

### Lógica de tabs actualizada
```ts
madre: lists.filter(l => l.has_children || l.tipo === 'madre').length,
compradores: lists.filter(l => !l.has_children && l.tipo === 'compradores').length,
outbound: lists.filter(l => !l.has_children && l.tipo !== 'compradores' && l.tipo !== 'madre').length,
```

3 ficheros editados, cambios mínimos.

