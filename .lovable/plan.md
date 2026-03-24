

## Arreglar vinculación de empresa en leads + redirección a GoDeal

### Diagnóstico
He revisado `CompanyLinkCard.tsx`, `CompanySearchDialog.tsx`, `useEmpresas.ts` y `LeadDetailPage.tsx`. La estructura del código es correcta: los botones llaman `setIsSearchOpen(true)` y el Dialog tiene `open={isSearchOpen}`. Sin embargo hay un problema probable:

**`CompanySearchDialog` depende de `useEmpresas()` sin filtros**, que lanza una query pesada a `v_empresas_con_actividad` (40k+ registros) solo para obtener las primeras 20 empresas en el listado inicial. Si esta query falla o tarda demasiado, el dialog se queda en blanco o no carga resultados. Además, el `useEffect` que inicializa resultados depende de `empresas` que puede llegar vacío.

### Cambios

**1. `CompanySearchDialog.tsx`** — Hacer la búsqueda independiente y robusta
- Eliminar la dependencia de `useEmpresas()` para el listado completo (query pesada innecesaria)
- Usar una query directa a `empresas` (tabla, no vista) con búsqueda por nombre/CIF
- Cargar resultados iniciales con una query ligera (últimas 20 empresas) o con `initialSearch` si existe
- Añadir manejo de errores visible

**2. `CompanyLinkCard.tsx`** — Añadir redirección a GoDeal tras vincular
- Después de `handleLink` exitoso, abrir `https://godeal.es/empresas/{empresaId}` en nueva pestaña
- Mostrar toast de confirmación con enlace

**3. `CompanyLinkCard.tsx`** — Asegurar que los botones responden
- Añadir estados de loading a los botones para feedback visual
- Asegurar que los Dialog se montan correctamente aunque la query principal falle

### Detalle técnico

La `CompanySearchDialog` actual hace esto ineficiente:
```
useEmpresas() → query a v_empresas_con_actividad (40k registros, paginado) → usa las primeras 20
```

Se cambiará a:
```
query directa: supabase.from('empresas').select('*').order('created_at', desc).limit(20)
búsqueda: supabase.from('empresas').select('*').ilike(nombre/cif).limit(20)
```

Esto es mucho más rápido, no depende de la vista, y el dialog responderá inmediatamente.

