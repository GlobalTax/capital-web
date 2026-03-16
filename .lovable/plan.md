## ✅ Completado: Eliminar meta http-equiv="refresh" de todas las funciones SSR

### Cambios realizados

1. **`blog-ssr/index.ts`**: Eliminado `<meta http-equiv="refresh">`, CSS `.redirect-note` y párrafo "Redirigiendo".
2. **`news-ssr/index.ts`**: Eliminado `<meta http-equiv="refresh">`, CSS `.redirect-note` y párrafo "Redirigiendo".
3. **`pages-ssr/index.ts`**: Eliminado `<meta http-equiv="refresh">`, CSS `.redirect-note` y párrafo "Redirigiendo".
4. **`prerender-proxy/index.ts`**: Eliminado `<meta http-equiv="refresh">` del fallback HTML y reemplazado texto "Redirigiendo" por enlace estático.

### Resultado

- Las páginas SSR son ahora contenido final para bots, sin señales de redirección.
- Google indexará el contenido directamente en lugar de seguir un refresh.
- Verificado con curl: la respuesta de pages-ssr ya no contiene `http-equiv="refresh"`.

---

## ✅ Completado: og:url estático + SSR para noticias individuales

### Cambios realizados

1. **`index.html`**: Añadido `<meta property="og:url">` estático en el `<head>` + actualización dinámica en el script síncrono junto al canonical.

2. **`supabase/functions/news-ssr/index.ts`** (NUEVO): Edge function que genera HTML completo para `/recursos/noticias/:slug` con title, description, canonical, og:url, og:image, structured data (NewsArticle + BreadcrumbList + Organization) y breadcrumbs.

3. **`supabase/functions/prerender-proxy/index.ts`**: Añadido routing de `/recursos/noticias/:slug` → `news-ssr?slug=...` (antes iba a `pages-ssr` que devolvía metadata genérica).

4. **`supabase/config.toml`**: Registrada `news-ssr` con `verify_jwt = false`.

### Resultado

- Bots ven `og:url` en el HTML estático de todas las páginas (sin necesidad de JS)
- Noticias individuales tienen SSR completo con metadatos únicos por artículo
- Verificado con curl: título, canonical, og:url y structured data correctos

---

## ✅ Completado: Limpiar schemas JSON-LD en index.html

### Cambios realizados

- **Eliminado** `FinancialService` schema del `<head>` (era específico de páginas de servicios)
- **Eliminado** `FAQPage` schema del `<head>` (era específico de páginas con FAQ)
- **Mantenido** `Organization` schema (válido globalmente)
- **Mantenido** `WebPage` schema (válido globalmente)

### Resultado

- Solo quedan 2 schemas globales en `index.html`: Organization y WebPage
- FinancialService y FAQPage deben inyectarse dinámicamente vía `SEOHead` en sus páginas correspondientes

---

## ✅ Completado: Integración Lista de Contacto → Campaña Outbound

### Cambios realizados

1. **Migración SQL**: Añadida columna `source_list_id` (uuid) a `valuation_campaigns` con FK a `outbound_lists`.

2. **`src/components/admin/contact-lists/SendToCampaignDialog.tsx`** (NUEVO): Diálogo completo para enviar empresas de una lista a una campaña outbound. Incluye:
   - Selección entre crear nueva campaña o añadir a existente
   - Deduplicación por CIF contra la campaña destino (omite duplicados)
   - Deduplicación cross-campaña (aviso de empresas ya contactadas en otras campañas)
   - Mapeo automático de campos lista → campaña
   - Inserción en batches de 100

3. **`src/components/admin/campanas-valoracion/ImportFromListDialog.tsx`** (NUEVO): Diálogo para importar empresas desde lista dentro del paso 2 (CompaniesStep) de una campaña. Misma lógica de deduplicación.

4. **`src/pages/admin/ContactListDetailPage.tsx`**: Botón "Enviar a campaña" en la toolbar de acciones de la lista.

5. **`src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx`**: Botón "Importar desde lista de contacto" antes del formulario manual.

6. **`src/pages/admin/CampanasValoracion.tsx`**: Badge con nombre de lista origen junto al nombre de la campaña (clickable, navega a la lista).

7. **`src/hooks/useCampaigns.ts`**: Añadido `source_list_id` al tipo `ValuationCampaign`.

### Resultado

- Flujo directo lista → campaña con un solo clic
- Protección anti-duplicados a nivel de campaña y cross-campaña
- Trazabilidad: cada campaña muestra su lista origen
