
Objetivo: que `https://capittal.es/sitemap.xml` deje de mostrar URLs “de más” y coincida con el sitemap filtrado que ya definiste.

1) Diagnóstico (ya verificado)
- `capittal.es/sitemap.xml` y `webcapittal.lovable.app/sitemap.xml` están sirviendo un sitemap estático con rutas antiguas (incluye `/recursos/noticias`, `/lp/*`, legal, etc.).
- La Edge Function `generate-sitemap` sí devuelve el sitemap correcto y filtrado.
- El problema es de “fuente activa”: hoy el dominio público está usando el archivo generado en build (`scripts/generate-sitemap.mjs` + `public/sitemap.xml`), no la Edge Function.

2) Plan de implementación
- Actualizar `scripts/generate-sitemap.mjs` para que replique exactamente la lógica aprobada:
  - solo homepage, servicios, sectores, páginas estáticas permitidas
  - blog dinámico desde `blog_posts` con `is_published = true`
  - excluir noticias, legal, LP extra y demás rutas no permitidas
- Eliminar del script todo lo relacionado con:
  - `news_articles`
  - rutas legacy/multilenguaje/hreflang no requeridas
  - entradas fuera del scope aprobado
- Corregir ruta dinámica de blog en el script para que coincida con la URL canónica real que queréis indexar (evitar mezcla `/blog/*` vs `/recursos/blog/*`).

3) Endurecer para que no vuelva a romperse
- Definir una sola “fuente de verdad” de rutas del sitemap (lista única reutilizable) para evitar drift entre:
  - `supabase/functions/generate-sitemap/index.ts`
  - `scripts/generate-sitemap.mjs`
- Mantener `public/sitemap.xml` como artefacto generado (no manual), para que cada build publique exactamente el listado filtrado.

4) Validación final (obligatoria)
- Verificar en producción `https://capittal.es/sitemap.xml`:
  - debe contener rutas permitidas + posts publicados
  - no debe contener `/recursos/noticias`, `/legal/*`, `/lp/*` (excepto `/lp/calculadora`)
- Verificar también `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/generate-sitemap` para confirmar consistencia entre estático y edge.
- Hacer comprobación end-to-end de indexación:
  - enviar sitemap en GSC
  - inspeccionar 2-3 URLs de blog y confirmar estado “Indexable”.

Detalle técnico (resumen)
- Causa raíz: conflicto entre sitemap dinámico (Edge Function) y sitemap estático de build.
- Solución mínima efectiva: alinear `scripts/generate-sitemap.mjs` al nuevo filtro para que `/sitemap.xml` publicado sea el correcto.
- Solución ideal posterior (opcional): enrutar `/sitemap.xml` directamente a la Edge Function para dinámica en tiempo real sin esperar deploy.
