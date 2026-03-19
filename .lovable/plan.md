

## Fix: Directorio Empresas no carga (43,497 registros)

### Diagnóstico
La tabla `empresas` tiene **43,497 registros**. El hook `useEmpresas` intenta cargar TODOS paginando de 1000 en 1000 (44+ queries secuenciales contra la vista `v_empresas_con_actividad` con JOIN a `company_valuations`). Además, la página lanza 3 fetches simultáneos al montar: `useEmpresas()`, `useEmpresas({esTarget: true})`, y `useFavoriteEmpresas()` (que también carga TODAS las empresas).

### Solución: Paginación server-side con carga lazy por pestaña

**1. Refactorizar `useEmpresas.ts` — paginación server-side**
- Añadir parámetros `page` y `pageSize` (default 50)
- Hacer una sola query con `.range()` en vez del bucle while
- Añadir query separada para el count total: `supabase.from(...).select('*', { count: 'exact', head: true })`
- Retornar `{ empresas, totalCount, page, pageSize }`

**2. Refactorizar `useFavoriteEmpresas` — usar JOIN en vez de cargar todo**
- Cambiar la query para hacer `supabase.from('empresa_favorites').select('empresa_id, empresas!inner(*)')` en lugar de cargar TODAS las empresas y filtrar en cliente

**3. Actualizar `EmpresasPage.tsx` — carga lazy por pestaña**
- No llamar a `useEmpresas()` ni `useEmpresas({esTarget: true})` en el mount inicial
- Solo cargar datos cuando el usuario cambia a la pestaña correspondiente (usar estado `activeTab` para controlar qué hook se ejecuta con `enabled`)
- Añadir controles de paginación (anterior/siguiente) en la tabla
- Los stats se calculan con queries de count separadas y ligeras

**4. Actualizar `EmpresasTableVirtualized`** (si necesario)
- Aceptar props de paginación server-side (`totalCount`, `onPageChange`, `currentPage`)

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/hooks/useEmpresas.ts` | Paginación server-side, eliminar bucle while |
| `src/hooks/useEmpresaFavorites.ts` | JOIN en vez de cargar todo |
| `src/pages/admin/EmpresasPage.tsx` | Carga lazy por tab, paginación, stats con counts |

