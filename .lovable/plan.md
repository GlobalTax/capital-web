

## Simplificar "Generar descripción IA" — flujo automático desde URL

### Cambios

**1. Nueva Edge Function `generate-company-description`**
- Recibe `{ url }` por body
- Hace fetch del HTML de la URL (con User-Agent, redirect follow)
- Extrae texto visible (elimina `<script>`, `<style>`, tags HTML, decode entities)
- Trunca a 3000 caracteres
- Llama a `callAI` con el system prompt M&A proporcionado
- Devuelve `{ description }`
- Errores de fetch → HTTP 422 con mensaje descriptivo

**2. `supabase/config.toml`** — añadir entrada `generate-company-description` con `verify_jwt = false`

**3. `ContactListDetailPage.tsx` — eliminar modal, simplificar flujo**

- **Estado**: Reemplazar `aiGenCompany`, `aiGenText`, `aiGenLoading` (boolean) por solo `aiGenLoading: string | null` (ID de la empresa en proceso)
- **`handleAiGenerate(company)`**: Nuevo flujo directo:
  - Si `company.web` está vacío → toast warning y return
  - Llama a `generate-company-description` con la URL
  - Guarda `descripcion_actividad` en DB
  - Toast éxito o error según el caso
- **Dropdown**: El `DropdownMenuItem` llama directamente a `handleAiGenerate(company)`, muestra spinner inline si `aiGenLoading === company.id`
- **Modal eliminado**: Se borra completamente el Dialog de AI (líneas 1459-1491)

### Ficheros

| Fichero | Acción |
|---------|--------|
| `supabase/functions/generate-company-description/index.ts` | Crear |
| `supabase/config.toml` | Añadir función |
| `src/pages/admin/ContactListDetailPage.tsx` | Modificar (eliminar modal, simplificar handler) |

### No se toca
- Importador, notas inline, mover/copiar, configuración de lista
- Edge function anterior `generate-activity-from-text` (se mantiene por si se usa en otro sitio)

