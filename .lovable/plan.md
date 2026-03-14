

## URL Audit: Analysis & Improvement Plan

### Current State

After reviewing all 150+ routes in `AppRoutes.tsx`, the routing structure is generally well-organized with hyphenated, descriptive paths. However, there are several issues that need fixing.

---

### Issues Found

#### 1. Inconsistent blog URL hierarchy
Blog listing lives at `/recursos/blog` but individual posts render at `/blog/:slug` instead of `/recursos/blog/:slug`. There is a redirect from `/blog` → `/recursos/blog`, but post detail pages break the hierarchy.

**Fix**: Change `/blog/:slug` to `/recursos/blog/:slug` and add a redirect from `/blog/:slug` → `/recursos/blog/:slug`.

#### 2. Multilingual routes create duplicate content
Routes like `/venda-empreses`, `/sell-companies`, `/buy-companies`, `/contacte`, `/equip` render the same component directly instead of redirecting to the canonical Spanish URL. Only `/compra-empreses` correctly redirects. This causes duplicate content for search engines.

**Fix**: Convert all non-canonical language aliases to `<Navigate to="..." replace />` redirects. Keep only Spanish as canonical routes (consistent with sitemap and `robots.txt` which only list Spanish URLs).

Affected routes:
- `/venda-empreses` → redirect to `/venta-empresas`
- `/sell-companies` → redirect to `/venta-empresas`
- `/buy-companies` → redirect to `/compra-empresas`
- `/contacte`, `/contact` → redirect to `/contacto`
- `/programa-col·laboradors`, `/programa-col-laboradors`, `/collaborators-program` → redirect to `/programa-colaboradores`
- `/casos-exit`, `/success-stories` → redirect to `/casos-exito`
- `/per-que-triar-nos`, `/why-choose-us` → redirect to `/por-que-elegirnos`
- `/equip` → redirect to `/equipo`
- `/ca`, `/inici`, `/en` → redirect to `/`
- All `/serveis/*` routes → redirect to `/servicios/*`
- All `/services/*` routes → redirect to `/servicios/*`
- All `/sectors/*` (Catalan/English) → redirect to `/sectores/*`

#### 3. Query parameter in redirect
`/lp/calculadora-web` redirects to `/lp/calculadora?source=web` adding a query parameter. This is an internal tracking concern — the `source=web` should be handled via UTM parameters in the original link or stored differently, not baked into the redirect target.

**Fix**: Redirect `/lp/calculadora-web` → `/lp/calculadora` (clean URL). If source tracking is needed, use UTM params at the campaign level.

#### 4. No trailing slash normalization
There is no global handling to strip or enforce trailing slashes, which can cause duplicate URL indexing (e.g., `/contacto` vs `/contacto/`).

**Fix**: Add a small `TrailingSlashRedirect` component at the top of `AppRoutes` that strips trailing slashes via `<Navigate>`.

#### 5. `/v2` and `/test/*` routes are indexable
Test/preview routes like `/v2` and `/test/nuevo-diseno` are publicly accessible without `noindex`.

**Fix**: These are internal — no routing change needed, but ensure `SEOHead` on these pages uses `noindex, nofollow`.

---

### Summary of Changes

| File | Change |
|------|--------|
| `src/core/routing/AppRoutes.tsx` | Convert ~30 multilingual aliases to `<Navigate>` redirects; change `/blog/:slug` to `/recursos/blog/:slug` + add old path redirect; add trailing slash stripper; simplify calculadora-web redirect |
| Blog-related components | Update any internal links from `/blog/` to `/recursos/blog/` |
| SEO/sitemap | No changes needed (sitemap already only lists Spanish canonical URLs) |

All changes are redirect-based — no visual, functional, or UX impact. Existing bookmarks and crawled URLs will 301-redirect to canonical paths.

