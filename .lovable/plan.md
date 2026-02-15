

## Independent Indexing for English and Catalan Pages

### Problem
Every page component hardcodes the canonical URL to the Spanish version (e.g., `canonical="https://capittal.es/equipo"`). When Google crawls `/team`, it sees `canonical -> /equipo` and correctly treats it as "Alternate page with proper canonical tag" -- meaning `/team` is never indexed independently. This affects 8 URLs reported in GSC.

### Solution
Make each page set its canonical URL to its **own path** (not the Spanish one). Google will then see `/team`, `/equip`, and `/equipo` as three independent pages linked via `hreflang`, each indexable in its respective language search results.

### What Changes

**Core principle**: `canonical` must always match the current URL path, never point to another language variant. Hreflang tags (already correctly configured) tell Google about the language relationship.

#### 1. Update ~17 page components

For every page that has multilingual routes, change the hardcoded canonical to use the current path dynamically.

Before:
```tsx
<SEOHead canonical="https://capittal.es/equipo" ... />
```

After:
```tsx
const location = useLocation();
// ...
<SEOHead canonical={`https://capittal.es${location.pathname}`} ... />
```

**Pages to update:**
- `src/pages/Equipo.tsx`
- `src/pages/CasosExito.tsx`
- `src/pages/por-que-elegirnos/index.tsx` (or equivalent)
- `src/pages/CompraEmpresas.tsx`
- `src/pages/VentaEmpresas.tsx`
- `src/pages/Contacto.tsx`
- `src/pages/ProgramaColaboradores.tsx`
- `src/pages/DeLooperACapittal.tsx`
- `src/pages/servicios/Valoraciones.tsx`
- `src/pages/servicios/VentaEmpresas.tsx` (service page)
- `src/pages/servicios/DueDiligence.tsx`
- `src/pages/servicios/AsesoramientoLegal.tsx`
- `src/pages/servicios/Reestructuraciones.tsx`
- `src/pages/servicios/PlanificacionFiscal.tsx`
- `src/pages/sectores/Tecnologia.tsx` (and all other sector pages)
- `src/pages/TerminosUso.tsx`
- `src/pages/LandingCalculator.tsx` (for `?lang=en` variant)

Most of these already import `useLocation` or `useHreflang` (which provides path awareness), so the change is minimal per file.

#### 2. Update `useHreflang` hook

The hook already sets canonical correctly to `currentPath` (line 145), but `SEOHead` overwrites it afterward because both manipulate the same DOM element. Fix: ensure `SEOHead`'s canonical and `useHreflang`'s canonical are consistent. Since we're fixing the source (the `canonical` prop), no change needed in the hook itself.

#### 3. Update `pages-ssr` Edge Function

Add unique entries for the English and Catalan paths in `PAGES_DATA` (or expand the alias system) so crawlers receive the correct canonical for each language variant. Currently, aliases map to Spanish data which has the Spanish canonical.

For each alias, override the canonical and hreflang in the served HTML:
- `/team` serves `canonical: https://capittal.es/team` with hreflang pointing to `/equipo` (es), `/equip` (ca), `/team` (en)
- `/equip` serves `canonical: https://capittal.es/equip` with same hreflang set

#### 4. Update `public/sitemap.xml`

Ensure English and Catalan URLs are listed with their own `<loc>` entries (not just as `xhtml:link` alternates of Spanish pages). Each variant should appear as a standalone `<url>` block with its own canonical loc.

### Files to modify

| File | Change |
|------|--------|
| ~17 page components (listed above) | Replace hardcoded `canonical` with dynamic `location.pathname` |
| `supabase/functions/pages-ssr/index.ts` | Serve unique canonical per language path instead of always Spanish |
| `public/sitemap.xml` | Add standalone entries for EN/CA URLs |

### Expected Result
- Google indexes `/team`, `/equip`, and `/equipo` as 3 separate pages
- Each appears in search results for its respective language
- Hreflang tags (already correct) link them as language variants
- The 8 "Alternate page with proper canonical" warnings in GSC resolve

