

## Diagnóstico: el sitemap correcto no se ha publicado todavía

### Situación actual

Los 3 ficheros fuente ya están correctos en el repositorio:
- `public/sitemap.xml` — 25 URLs limpias (solo las aprobadas)
- `supabase/functions/generate-sitemap/index.ts` — mismas 25 + blog dinámico
- `scripts/generate-sitemap.mjs` — alineado con la lista aprobada

**El problema es que la app no se ha republicado.** Tanto `capittal.es/sitemap.xml` como `webcapittal.lovable.app/sitemap.xml` siguen sirviendo el build anterior con las 400+ URLs antiguas.

### Acción necesaria

No hay cambios de código pendientes. Solo necesitas **publicar la app** (botón "Publish" en Lovable) para que el nuevo `public/sitemap.xml` se despliegue.

Una vez publicada, `capittal.es/sitemap.xml` mostrará solo las 25 rutas estáticas aprobadas. Los posts de blog dinámicos se añadirán cuando ejecutes `node scripts/generate-sitemap.mjs` en el pipeline de build, o puedes usar la Edge Function (`/functions/v1/generate-sitemap`) que ya devuelve el sitemap completo con blog.

### Verificación post-deploy

1. Acceder a `https://capittal.es/sitemap.xml` y confirmar que solo tiene las URLs aprobadas
2. Reenviar el sitemap en Google Search Console

