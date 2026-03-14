

## Plan: Simplify robots.txt

`public/sitemap.xml` was already deleted previously — confirmed it's not in the `public/` directory.

The user wants `robots.txt` simplified to remove all the verbose per-bot rules and keep only the essential directives. This is valid — the Cloudflare Worker already handles bot-specific behavior, so the robots.txt just needs to be clean and minimal.

### Changes

| File | Action |
|------|--------|
| `public/robots.txt` | Rewrite to minimal version: single `User-agent: *` block with `Allow: /`, essential `Disallow` rules for private paths, and the single `Sitemap` directive |

### New `robots.txt` content

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin-login/
Disallow: /auth/
Disallow: /api/private/
Disallow: /operaciones/

Sitemap: https://capittal.es/sitemap.xml
```

This removes:
- Duplicate per-bot blocks (Googlebot, GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, CCBot) — unnecessary since `User-agent: *` covers all
- Vite/websocket disallows (irrelevant in production)
- Query parameter disallows (handled better via canonical tags)
- Googlebot-Image block
- Comment blocks about ai.txt and llms.txt

**Note**: The CCBot block (`Disallow: /`) will be removed. If you want to keep blocking CCBot specifically, let me know.

