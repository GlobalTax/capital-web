

## Plan: Buscador por actividad + Generación de descripción con IA

### MEJORA 1 — Buscador por keywords en descripcion_actividad

**A) Vista principal (`ContactListsPage.tsx`)**

1. Añadir estado `activitySearch` y `debouncedActivitySearch` (400ms)
2. Añadir un segundo Input en la Card de filtros con placeholder "Buscar por actividad... (ej: centro especial empleo, instalación eléctrica)"
3. Cuando `debouncedActivitySearch` tiene valor, ejecutar una query a `outbound_list_companies` con `.ilike('descripcion_actividad', '%keyword%')` que devuelve `list_id` y count
4. Usar el resultado para filtrar `filtered` (solo listas que tienen matches) y mostrar debajo del nombre de cada lista un badge/texto "X empresas coinciden"
5. Query con `useQuery` que depende de `debouncedActivitySearch`, deshabilitada si vacío

**B) Vista detalle (`ContactListDetailPage.tsx`, pestaña Empresas)**

1. Añadir estado `activitySearchQuery` junto al `searchQuery` existente
2. Añadir un segundo Input en la barra de búsqueda con placeholder "Buscar por actividad..."
3. En `filteredCompanies`, añadir filtro adicional: si `activitySearchQuery`, filtrar con `(c.descripcion_actividad || '').toLowerCase().includes(q)` (filtrado client-side ya que las empresas están cargadas)

### MEJORA 2 — Generación de descripción con IA

**A) Nueva edge function `generate-activity-from-text`**

- Reutiliza `callAI` del `ai-helper.ts` existente
- System prompt: el proporcionado por el usuario (asistente M&A, máx 3 frases, optimizada para keywords)
- Recibe `{ text: string, company_name?: string }`, devuelve `{ description: string }`
- Usa Lovable AI (default) via `callAI` sin `preferOpenAI`

**B) UI en `ContactListDetailPage.tsx`**

1. Añadir estado `aiGenCompany` (empresa seleccionada para generar), `aiGenText` (texto pegado), `aiGenLoading`
2. En el dropdown de cada empresa, nueva opción "Generar descripción IA" (icono Sparkles)
3. Modal con:
   - Textarea grande con placeholder "Pega aquí cualquier texto sobre la empresa..."
   - Botón "Generar" que llama a la edge function
   - Spinner mientras genera
4. Al recibir respuesta, actualizar `descripcion_actividad` en `outbound_list_companies` vía supabase update + invalidar query + toast éxito

**C) config.toml**
- Añadir entrada para `generate-activity-from-text` con `verify_jwt = false`

### Ficheros modificados/creados

- `src/pages/admin/ContactListsPage.tsx` — añadir buscador actividad + query
- `src/pages/admin/ContactListDetailPage.tsx` — buscador actividad + modal IA + dropdown option
- `supabase/functions/generate-activity-from-text/index.ts` — nueva edge function
- `supabase/config.toml` — añadir función

