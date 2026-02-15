

## Sincronizar hreflang de sectores en generate-sitemap

### Estado actual

Todas las paginas solicitadas ya estan presentes en ambos sitemaps con las prioridades correctas (o superiores). El blog se actualiza automaticamente via consulta a Supabase.

### Problema detectado

El `HREFLANG_MAP` de la Edge Function `generate-sitemap` no incluye los sectores, pero el sitemap estatico (`public/sitemap.xml`) si tiene hreflang para ellos. Esto crea una discrepancia que afectaria si se usa el sitemap dinamico como fuente principal.

### Cambio propuesto

Anadir los sectores al `HREFLANG_MAP` en `supabase/functions/generate-sitemap/index.ts`:

```text
/sectores/tecnologia -> ca: /sectors/tecnologia, en: /sectors/technology
/sectores/healthcare -> ca: /sectors/salut, en: /sectors/healthcare
/sectores/seguridad -> ca: /sectors/seguretat, en: /sectors/security
/sectores/industrial -> ca: /sectors/industrial
/sectores/retail-consumer -> ca: /sectors/retail-consum
/sectores/energia -> ca: /sectors/energia, en: /sectors/energy
/sectores/construccion -> ca: /sectors/construccio
/sectores/logistica -> ca: /sectors/logistica
/sectores/alimentacion -> ca: /sectors/alimentacio
/sectores/medio-ambiente -> ca: /sectors/medi-ambient
```

### Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/generate-sitemap/index.ts` | Anadir 10 entradas de sectores al `HREFLANG_MAP` (lineas 12-27) |

### Detalle tecnico

Se amplia el objeto `HREFLANG_MAP` con las 10 rutas de sectores. Cada entrada incluye la variante catalana y, cuando existe, la inglesa. El `PATH_TO_GROUP` reverse map se recalcula automaticamente, por lo que las entradas en `staticRoutes` que ya existen para sectores (lineas 72-81) generaran automaticamente las etiquetas `xhtml:link` correspondientes.

No se necesitan cambios en `staticRoutes` ni en `public/sitemap.xml` ni en `robots.txt`.

