

## Plan: Remove Static Sitemap and Clean robots.txt

### Changes

1. **Delete `public/sitemap.xml`** — Remove the static file so only the dynamic sitemap served via Cloudflare Worker at `https://capittal.es/sitemap.xml` exists.

2. **Verify `public/robots.txt`** — Already confirmed: there is only one `Sitemap:` line (line 77) pointing to `https://capittal.es/sitemap.xml`. The `llms.txt` reference is commented out. No changes needed to robots.txt.

### Files

| File | Action |
|------|--------|
| `public/sitemap.xml` | **Delete** |
| `public/robots.txt` | No changes needed (already correct) |

