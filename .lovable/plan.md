

## Actualizar sitemap.xml y sincronizar paginas faltantes

### Situacion actual
- Todas las fechas `lastmod` en `public/sitemap.xml` son `2026-02-15` (ayer)
- Faltan 5 landing pages que existen en `static-landing-pages.ts` pero no estan ni en el sitemap estatico ni en la Edge Function:
  - `/lp/calculadora-meta` (Meta Ads)
  - `/lp/venta-empresas-v2` (A/B testing)
  - `/lp/valoracion-2026` (campana estacional)
  - `/lp/rod-linkedin` (LinkedIn)
  - `/lp/accountex` (evento)
- Faltan variantes catalanas de algunos sectores en el sitemap estatico (retail-consum, industrial, energia, logistica, alimentacio, medi-ambient)

### Cambios

**1. `public/sitemap.xml` - Actualizar fechas y anadir paginas**
- Cambiar todos los `lastmod` de `2026-02-15` a `2026-02-16`
- Anadir las 5 landing pages que faltan en la seccion de Landing Pages
- Anadir las variantes catalanas de sectores que faltan (sectors/retail-consum, sectors/industrial, sectors/energia, sectors/logistica, sectors/alimentacio)

**2. `supabase/functions/generate-sitemap/index.ts` - Anadir LPs faltantes**
- Anadir las 5 landing pages al array `staticRoutes` para mantener sincronizacion con el sitemap estatico

### Seccion tecnica

**Paginas nuevas a anadir (ambos archivos):**

```text
/lp/calculadora-meta    -> priority 0.9, changefreq monthly
/lp/venta-empresas-v2   -> priority 0.9, changefreq monthly
/lp/valoracion-2026     -> priority 0.85, changefreq monthly
/lp/rod-linkedin        -> priority 0.85, changefreq monthly
/lp/accountex           -> priority 0.8, changefreq monthly
```

**Variantes catalanas de sectores a anadir (solo sitemap.xml):**
Estas ya estan en la Edge Function pero faltan en el archivo estatico:
- `/sectors/retail-consum`
- `/sectors/industrial`
- `/sectors/energia`
- `/sectors/logistica`
- `/sectors/alimentacio`

**Archivos modificados:** `public/sitemap.xml`, `supabase/functions/generate-sitemap/index.ts`
**Sin nuevas dependencias**

