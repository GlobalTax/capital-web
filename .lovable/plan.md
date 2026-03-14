

## Plan: SEO Indexing Fix — Centralized Routes, Prerender Cache, and Admin Debug Page

This is a large, multi-part implementation. Here's the structured plan:

---

### 1. Create `src/data/siteRoutes.ts` — Centralized Route Registry

A single source of truth for all public indexable routes (~40-50 entries). Each entry includes:
- `path`, `title`, `description`, `h1`, `internalLinks[]`, `lastmod`, `priority`, `changefreq`

This will be imported by the sitemap generator, prerender function, and SEO debug page. Replaces the duplicated route lists in `generate-sitemap/index.ts` and the `index.html` sync script.

---

### 2. Audit & Fix `navigate()` → `<Link>` on Public Pages

**Found in public-facing components** (5 files, ~8 instances):
- `VentaEmpresasHero.tsx` — navigate to `/lp/calculadora`
- `SearchFundsHero.tsx` — navigate to `/contacto`
- `SearchFundsForSellers.tsx` — navigate to `/lp/calculadora`
- `SearchFundsForSearchers.tsx` — navigate to `/search-funds/registro-searcher`
- `DeLooperACapittalContent.tsx` — 3 navigates to `/lp/calculadora` and `/contacto`
- `LandingCalculatorMetaThanks.tsx` — navigate to `/lp/calculadora-meta`

Each will be converted to `<Button asChild><Link to="...">` or `<a href="...">` so crawlers see real `<a href>` tags. Admin pages (606 matches) will NOT be touched.

---

### 3. Create `supabase/functions/prerender/index.ts` — Edge Prerender Scanner

New edge function that:
- Accepts `?path=/some-page`, optional `?refresh=true`, `?bulk=true`
- Fetches the published URL via HTTP GET
- Parses HTML with regex to extract title, description, H1, H2s, internal links
- Falls back to `siteRoutes` registry metadata when SPA returns empty shell
- Stores results in `prerender_cache` table
- Computes health: green/yellow/red based on presence of critical elements
- Records `source` ("fetched" vs "registry-fallback") and `extraction_notes`
- Admin auth required (validates JWT + `has_role` check)
- SSRF validation: path must start with `/`, no `@`, `//`, `\`, or protocol schemes
- Rate limiting: 5 bulk/hour, 60 single/hour (tracked via table)
- CORS headers for Lovable preview domains and production

---

### 4. Update `supabase/functions/generate-sitemap/index.ts`

Refactor to import route data from a shared constant (duplicated in edge function context since `src/data` isn't accessible). Add admin auth. Keep it as a generation tool (not the live endpoint — `robots.txt` points to static `/sitemap.xml`).

---

### 5. Database Migration — `prerender_cache` Table

```sql
CREATE TABLE public.prerender_cache (
  path TEXT PRIMARY KEY,
  html_snapshot TEXT,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  h2s JSONB DEFAULT '[]',
  internal_links JSONB DEFAULT '[]',
  internal_links_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  rendered_at TIMESTAMPTZ,
  source TEXT,
  health TEXT DEFAULT 'red',
  extraction_notes JSONB DEFAULT '[]',
  full_record BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: service role read/write, admins read, block anon
ALTER TABLE public.prerender_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.prerender_cache
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can read" ON public.prerender_cache
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid()::text, 'admin'));
```

Also a rate-limit tracking table:
```sql
CREATE TABLE public.prerender_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  scan_type TEXT NOT NULL, -- 'single' or 'bulk'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 6. Admin SEO Debug Page — `/admin/seo-debug`

New page with three sections:
1. **Single Page Inspector**: Input a path, trigger scan, display extracted title/description/H1/H2s/links with health badge and extraction notes
2. **Crawl Coverage Panel**: Table of all routes from registry showing health status, present/missing elements, last scan date, per-row refresh and bulk scan button
3. **Sitemap Regeneration Button**: Calls `generate-sitemap` and displays the XML

Protected by `AdminProtectedRoute` (already wraps `/admin/*`). The `has_role` check is enforced at the edge function level.

---

### 7. Enhanced `index.html` `<noscript>` Block

Already present (lines 359-410). Will verify completeness and add any missing key links (e.g., `/por-que-elegirnos`, `/casos-exito`, `/programa-colaboradores`, `/search-funds`).

---

### 8. Route Registration & robots.txt

- Add lazy import for `SeoDebugPage` in `AppRoutes.tsx` (under existing `/admin/*` wildcard — no new route needed, just the admin sub-page)
- `robots.txt` already blocks `/admin/` — no changes needed

---

### 9. Remove `React.lazy()` from Public Marketing Pages

Convert these from `lazy()` to direct imports in `AppRoutes.tsx`:
- `Index`, `VentaEmpresas`, `CompraEmpresas`, `Contacto`, `CasosExito`, `PorQueElegirnos`, `Equipo`, `ProgramaColaboradores`, `DeLooperACapittal`
- All service pages: `Valoraciones` (already direct), `VentaEmpresasServicio`, `DueDiligence`, `AsesoramientoLegal`, etc.
- All sector pages: `Tecnologia`, `Healthcare`, `Industrial`, etc.
- Resource pages: `Blog`, `BlogPost`, `TestExitReady`, `SearchFunds`
- Calculator landing: `LandingCalculator`

Keep `lazy()` for: `Admin`, `AdminLoginNew`, `AuthPage`, all `/admin/*` sub-pages, `Oportunidades`, `SavedOperations`, and other authenticated tools.

---

### 10. CORS Verification

Ensure all edge functions (prerender, generate-sitemap, new prerender scanner) include both `.lovable.app` and `.lovableproject.com` preview domains plus `capittal.es` in CORS headers. Current pattern uses `*` which already covers all origins.

---

### Files to Create/Modify

| Action | File |
|--------|------|
| **Create** | `src/data/siteRoutes.ts` |
| **Create** | `supabase/functions/prerender/index.ts` |
| **Create** | `src/pages/admin/SeoDebugPage.tsx` |
| **Modify** | `src/core/routing/AppRoutes.tsx` (remove lazy for public pages, add seo-debug route) |
| **Modify** | `supabase/functions/generate-sitemap/index.ts` (add auth, use shared routes) |
| **Modify** | `index.html` (enhance noscript block) |
| **Modify** | `src/components/venta-empresas/VentaEmpresasHero.tsx` |
| **Modify** | `src/components/search-funds/SearchFundsHero.tsx` |
| **Modify** | `src/components/search-funds/SearchFundsForSellers.tsx` |
| **Modify** | `src/components/search-funds/SearchFundsForSearchers.tsx` |
| **Modify** | `src/components/DeLooperACapittalContent.tsx` |
| **Modify** | `src/pages/LandingCalculatorMetaThanks.tsx` |
| **Migration** | Create `prerender_cache` and `prerender_rate_limits` tables |

