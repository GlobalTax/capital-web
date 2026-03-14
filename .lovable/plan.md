

## Plan: Remove "Barcelona" from titles in pages-ssr

The file is confirmed to have the two lines that need changing. Since previous deploy attempts failed due to file size, we'll deploy using the `supabase--deploy_edge_functions` tool.

### Changes

| File | Line | Current | New |
|------|------|---------|-----|
| `supabase/functions/pages-ssr/index.ts` | 87 | `"Capittal \| Asesores M&A Especializados en el Sector Seguridad - Barcelona"` | `"Capittal \| Asesores M&A Especializados en el Sector Seguridad"` |
| `supabase/functions/pages-ssr/index.ts` | 89 | description ending in `"Barcelona."` | Remove `" Barcelona."` → end at `"profesionales."` |
| `supabase/functions/pages-ssr/index.ts` | 785 | `"Contacto \| Capittal Transacciones - Asesores M&A Barcelona"` | `"Contacto \| Capittal Transacciones"` |

Three line edits in one file, then deploy via the edge function deploy tool.

