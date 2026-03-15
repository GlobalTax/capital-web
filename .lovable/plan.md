

## Plan: Eliminar página `/valoracion-empresas` y redirigir a `/servicios/valoraciones`

### Cambios

1. **Eliminar** `src/pages/ValoracionEmpresas.tsx`

2. **Editar** `src/core/routing/AppRoutes.tsx`:
   - Quitar import de `ValoracionEmpresas`
   - Cambiar la ruta `/valoracion-empresas` a `<Navigate to="/servicios/valoraciones" replace />`

3. **Actualizar enlaces internos** que apuntan a `/valoracion-empresas`:
   - `src/components/header/data/recursosData.ts` → cambiar href a `/servicios/valoraciones`
   - `src/pages/GuiaValoracionEmpresas.tsx` → 2 enlaces, apuntar a `/servicios/valoraciones`
   - `src/pages/NotFound.tsx` → cambiar href a `/servicios/valoraciones`
   - `src/pages/recursos/InformesMA.tsx` → cambiar href a `/servicios/valoraciones`
   - `src/data/siteRoutes.ts` → actualizar path a `/servicios/valoraciones`
   - `src/utils/seo/schemas.ts` → actualizar URL

4. **Limpiar SSR/SEO** en edge functions:
   - `supabase/functions/pages-ssr/index.ts` → eliminar entrada `/valoracion-empresas`
   - `supabase/functions/generate-sitemap/index.ts` → eliminar entrada
   - `supabase/functions/prerender/index.ts` → eliminar entrada

