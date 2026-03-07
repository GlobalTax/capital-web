

# Migrar las 17 Edge Functions restantes al helper centralizado

## Funciones pendientes

| Funcion | Patron actual | Complejidad |
|---------|--------------|-------------|
| `generate-corporate-email` | Lovable directo | Simple |
| `sf-weekly-news-scan` | Lovable + OpenAI fallback manual | Media |
| `sf-dedupe-check` | Lovable directo | Simple |
| `potential-buyer-enrich` | Lovable + OpenAI directo | Media |
| `cr-portfolio-news-scan` | Lovable + OpenAI fallback manual | Media |
| `sf-generate-queries` | Lovable directo | Simple |
| `cr-portfolio-diff-scan` | Lovable + OpenAI fallback manual | Media |
| `generate-company-summary` | OpenAI + Lovable fallback manual | Media |
| `fund-scrape-website` | OpenAI directo | Simple |
| `cr-funds-enrich` | OpenAI directo | Simple |
| `corporate-buyer-batch-enrich` | OpenAI directo | Simple |
| `dealsuite-scrape-wanted` | OpenAI directo | Simple |
| `generate-sector-dossier` | OpenAI directo | Media (largo) |
| `ai-content-studio` | OpenAI directo | Simple |
| `corporate-buyer-enrich` | OpenAI + Firecrawl | Media |
| `cr-portfolio-enrich` | OpenAI directo | Simple |
| `generate-newsletter-image` | Lovable (image gen) | Especial - se excluye |

**Total: 16 migrables** (`generate-newsletter-image` usa endpoint de generacion de imagenes, no compatible con el helper de texto).

## Cambios por funcion

Para cada una:
1. Importar `callAI`, `parseAIJson`, `aiErrorResponse` desde `../_shared/ai-helper.ts`
2. Reemplazar el bloque `fetch(ai.gateway...)` o `fetch(api.openai...)` por `callAI(messages, config)`
3. Reemplazar parseo manual de JSON por `parseAIJson()`
4. Reemplazar error handling manual por `aiErrorResponse()`
5. Para funciones con fallback manual (sf-weekly-news-scan, cr-portfolio-news-scan, cr-portfolio-diff-scan, generate-company-summary): eliminar la logica dual y usar `callAI()` que ya maneja fallback internamente

### Configuracion por funcion
- **OpenAI-first** (precision JSON): `corporate-buyer-enrich`, `cr-funds-enrich`, `cr-portfolio-enrich`, `generate-sector-dossier`, `dealsuite-scrape-wanted` → `{ preferOpenAI: true }`
- **Lovable-first** (coste): el resto → config default

## Orden de implementacion

Se hara en un solo paso, migrando las 16 funciones.

