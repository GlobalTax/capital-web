

## Fix: "Cannot access 'isMadreList' before initialization"

### Problema
`isMadreList` se define en la línea 502 (`const isMadreList = !!sublistCompanyMap`), pero se usa en el `useMemo` de `filteredCompanies` (línea 393) que está declarado antes. Esto causa un `ReferenceError` por temporal dead zone.

### Solución
Mover la línea `const isMadreList = !!sublistCompanyMap;` justo después de la query `sublistCompanyMap` (línea 500) y **antes** del `useMemo` de `filteredCompanies`. Como el `useMemo` de `filteredCompanies` está en las líneas ~350-401, hay que reorganizar:

**Archivo: `src/pages/admin/ContactListDetailPage.tsx`**

1. En la línea 393, reemplazar `isMadreList` por `!!sublistCompanyMap` directamente (inline), ya que `sublistCompanyMap` sí está disponible en ese punto (viene de `useQuery` línea 461).

   **Pero** — `sublistCompanyMap` se define en línea 461, que también está **después** del useMemo de línea 393. Así que el verdadero fix es **mover el bloque del `useMemo` de `filteredCompanies`** (líneas ~350-401) después de la definición de `sublistCompanyMap` (línea 500), o mover la query de `sublistCompanyMap` antes del useMemo.

   La opción más limpia: mover la query `sublistCompanyMap` (líneas 460-500) y `isMadreList` (línea 502) **antes** del `useMemo` de `filteredCompanies`.

2. Añadir `sublistCompanyMap` al array de dependencias del `useMemo` (línea 401).

### Cambio concreto
- Cortar líneas 460-502 (query `sublistCompanyMap` + `isMadreList`) y pegarlas antes de la línea ~350 (inicio del `filteredCompanies` useMemo).
- Añadir `isMadreList, sublistCompanyMap` a las dependencias del useMemo en línea 401.

Un solo archivo editado.

