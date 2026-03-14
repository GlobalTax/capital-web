

## Analysis: Sitemap "Wrong Format" Issue

### Root Cause

Ahrefs reports `sitemap.xml` at **33 bytes** with "wrong format" warning. The `public/sitemap.xml` in the repo is 153 lines and looks valid, BUT:

1. **Route mismatch**: The static `public/sitemap.xml` uses paths like `/servicios/venta-empresas`, `/servicios/compra-empresas` — but the actual site routes (per `siteRoutes.ts` and the live site) are `/venta-empresas`, `/compra-empresas` (no `/servicios/` prefix for the main pages).

2. **Stale/mismatched content**: The production sitemap (served via Cloudflare) includes `xhtml:link` hreflang tags and different routes than what's in `public/sitemap.xml`. The Cloudflare Worker is likely serving a different sitemap or the static file is being intercepted/replaced.

3. **The llms.txt Sitemap issue** was already fixed (commented out in robots.txt). The remaining issue is the sitemap.xml itself.

### Plan

**Regenerate `public/sitemap.xml`** using the centralized `siteRoutes.ts` registry as the source of truth:

- Include all ~35 public routes from `siteRoutes.ts` with correct paths (`/venta-empresas`, not `/servicios/venta-empresas`)
- Add blog index route
- Add `xmlns:xhtml` namespace and hreflang alternates if the production sitemap uses them (it does)
- Ensure valid XML declaration and structure
- Remove the duplicate/incorrect routes that don't match actual site URLs (e.g., `/servicios/compra-empresas` should be `/compra-empresas`)

**Also sync `generateSitemap.ts` and `generate-sitemap/index.ts`** route lists with `siteRoutes.ts` to prevent future drift.

### Files to Modify

| File | Change |
|------|--------|
| `public/sitemap.xml` | Regenerate with correct routes from siteRoutes registry |
| `src/utils/seo/generateSitemap.ts` | Sync static routes to match siteRoutes.ts |

This is a 1-file critical fix (sitemap.xml) + 1 sync fix to prevent future mismatch.

