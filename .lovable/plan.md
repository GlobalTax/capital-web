

## Status: NOT yet implemented — the `meta http-equiv="refresh"` is still present in all 4 functions

### What needs to change

| File | Line | Remove/Change |
|------|------|---------------|
| `blog-ssr/index.ts` | 150 | Delete `<meta http-equiv="refresh" ...>` |
| `blog-ssr/index.ts` | 176 | Delete "Redirigiendo" paragraph |
| `news-ssr/index.ts` | 158 | Delete `<meta http-equiv="refresh" ...>` |
| `news-ssr/index.ts` | 189 | Delete "Redirigiendo" paragraph |
| `pages-ssr/index.ts` | 1987 | Delete `<meta http-equiv="refresh" ...>` |
| `pages-ssr/index.ts` | 2015 | Delete "Redirigiendo" paragraph |
| `prerender-proxy/index.ts` | 167 | Delete `<meta http-equiv="refresh" ...>` |
| `prerender-proxy/index.ts` | 171 | Replace "Redirigiendo" with static text (e.g., a simple `<p>` with a link, no redirect language) |

### Why

Google treats `<meta http-equiv="refresh">` as a redirect signal, which can cause:
- The SSR page to not be indexed (Google follows the redirect instead)
- Duplicate content signals between the SSR HTML and the SPA version

These SSR pages are meant to **be** the final content for bots — they should not redirect anywhere.

### Deployment

After edits, deploy all 4 functions via `supabase--deploy_edge_functions` and verify with curl that the output no longer contains `http-equiv="refresh"`.

