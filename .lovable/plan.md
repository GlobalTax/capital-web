

## Plan: Evitar duplicados entre tabs Madre y Compradores

### Problema
Una lista con `tipo = 'compradores'` que además tiene sublistas (`has_children = true`) aparece en ambos tabs.

### Solución
Priorizar "Madre": si una lista tiene hijos, solo aparece en Madre, nunca en Compradores ni Outbound.

### Cambio en `src/pages/admin/ContactListsPage.tsx`

**Contadores (líneas 87-91):**
```ts
madre: lists.filter(l => l.has_children).length,
compradores: lists.filter(l => !l.has_children && l.tipo === 'compradores').length,
outbound: lists.filter(l => !l.has_children && l.tipo !== 'compradores').length,
```

**Filtro compradores (línea 103):**
```ts
result = result.filter(l => !l.has_children && l.tipo === 'compradores');
```

Solo se edita `src/pages/admin/ContactListsPage.tsx` (2 líneas).

