

## Fix: Missing Routes Causing "Not Indexed" in Google Search Console

### Problem
Google Search Console shows ~30 URLs discovered but not indexed. Cross-referencing with `AppRoutes.tsx` reveals these URLs have **no route handlers**, so Google gets blank pages or 404s. The URLs come from three sources:
1. `useHreflang` hook generates alternate-language URLs that don't resolve
2. `sitemap.xml` / `generate-sitemap` lists URLs without matching routes
3. `SectorOperationsGrid` links to `/operaciones/:id` which has no route

### Root Cause Categories

| Category | Count | Examples |
|----------|-------|---------|
| Missing Catalan service routes (`/serveis/*`) | 5 | `/serveis/reestructuracions`, `/serveis/assessorament-legal`, `/serveis/due-diligence`, `/serveis/planificacio-fiscal`, `/serveis/venda-empreses` |
| Missing English service routes (`/services/*`) | 5 | `/services/legal-advisory`, `/services/sell-companies`, `/services/valuations`, `/services/tax-planning`, `/services/due-diligence` |
| Missing Catalan/English sector routes (`/sectors/*`) | 10 | `/sectors/healthcare`, `/sectors/salut`, `/sectors/energy`, `/sectors/technology`, `/sectors/retail-consumer`, `/sectors/industrial`, etc. |
| Non-existent sector pages | 3 | `/sectores/financial-services`, `/sectores/inmobiliario` (no React component exists) |
| Missing `/operaciones/:id` route | 5 | UUID-based operation detail pages linked from sector grids |
| Missing `/partners-program` English route | 1 | English version of programa-colaboradores |

### Solution

#### 1. Add Catalan service routes to AppRoutes.tsx

Map each Catalan path to its existing Spanish component:

```
/serveis/valoracions        -> Valoraciones
/serveis/venda-empreses     -> VentaEmpresasServicio
/serveis/due-diligence      -> DueDiligence
/serveis/assessorament-legal -> AsesoramientoLegal
/serveis/reestructuracions  -> Reestructuraciones
/serveis/planificacio-fiscal -> PlanificacionFiscal
```

#### 2. Add English service routes to AppRoutes.tsx

```
/services/valuations      -> Valoraciones
/services/sell-companies   -> VentaEmpresasServicio
/services/due-diligence    -> DueDiligence
/services/legal-advisory   -> AsesoramientoLegal
/services/restructuring    -> Reestructuraciones
/services/tax-planning     -> PlanificacionFiscal
```

#### 3. Add Catalan/English sector routes to AppRoutes.tsx

```
/sectors/tecnologia       -> Tecnologia
/sectors/technology       -> Tecnologia
/sectors/healthcare       -> Healthcare
/sectors/salut            -> Healthcare
/sectors/industrial       -> Industrial
/sectors/retail-consum    -> RetailConsumer
/sectors/retail-consumer  -> RetailConsumer
/sectors/energia          -> Energia
/sectors/energy           -> Energia
/sectors/seguretat        -> Seguridad
/sectors/security         -> Seguridad
/sectors/construccio      -> Construccion
/sectors/alimentacio      -> Alimentacion
/sectors/logistica        -> Logistica
/sectors/medi-ambient     -> MedioAmbiente
```

#### 4. Add `/partners-program` route

```
/partners-program -> ProgramaColaboradores
```

#### 5. Handle `/operaciones/:id` route

Create a simple redirect or detail page. Since these are operation detail links from `SectorOperationsGrid`, the simplest fix is to redirect to `/oportunidades` (the marketplace) or create a minimal operation detail page that shows basic info and a contact CTA.

Option: Redirect to oportunidades with a hash/param:
```
/operaciones/:id -> Redirect to /oportunidades or render an OperationDetail component
```

#### 6. Handle non-existent sectors (financial-services, inmobiliario)

These are referenced in `useHreflang` and `generateSitemap.ts` but have no React page component. Two options:
- **Option A**: Remove them from hreflang/sitemap (if these sectors are not planned)
- **Option B**: Create minimal sector pages for them

Recommended: Remove from hreflang and sitemap since they don't represent real content, and redirect any existing URLs to avoid soft 404s:
```
/sectores/financial-services -> Redirect to /sectores/tecnologia or /oportunidades
/sectores/inmobiliario       -> Redirect to /oportunidades
/sectors/serveis-financers   -> Same redirect
/sectors/immobiliari         -> Same redirect
/sectors/real-estate         -> Same redirect
/sectors/financial-services  -> Same redirect
```

### Files to modify

| File | Changes |
|------|---------|
| `src/core/routing/AppRoutes.tsx` | Add ~25 new Route entries for Catalan, English, and missing paths |
| `supabase/functions/pages-ssr/index.ts` | Add the new multilingual paths to `PAGES_DATA` map so crawlers get full HTML |
| `src/hooks/useHreflang.tsx` | Remove references to non-existent sectors (financial-services, inmobiliario) |
| `src/utils/seo/generateSitemap.ts` | Remove non-existent sector URLs from static sitemap |
| `public/sitemap.xml` | Update to match cleaned-up URL list |

### Expected Impact
- All ~30 "Not indexed" URLs will either resolve to real content or be properly redirected
- Google will stop discovering dead-end URLs from hreflang and sitemap
- Catalan and English users arriving via hreflang links will see the correct page
- Operation detail links from sector pages will work instead of 404-ing

