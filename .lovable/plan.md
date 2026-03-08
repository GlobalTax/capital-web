

# Actualizar robots.txt con reglas para crawlers de IA

## Cambios en `public/robots.txt`

Añadir después de las reglas de Googlebot-Image y antes del Sitemap:

1. **GPTBot** (OpenAI) - Allow con mismas restricciones de admin/auth
2. **ChatGPT-User** (OpenAI browsing) - Allow
3. **ClaudeBot** (Anthropic) - Allow
4. **PerplexityBot** (Perplexity AI) - Allow
5. **Google-Extended** (Gemini) - Allow
6. **CCBot** (Common Crawl) - **Disallow: /** para bloquear scraping masivo

Cada bot de IA permitido tendrá las mismas restricciones base (admin, auth, operaciones) para mantener consistencia de seguridad.

