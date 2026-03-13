

## Plan: Formatos LinkedIn editables (añadir/quitar)

### Enfoque

Crear una tabla `linkedin_format_options` en Supabase para almacenar los formatos disponibles. Reemplazar el array hardcoded `LINKEDIN_FORMAT_OPTIONS` por datos dinámicos de esta tabla. Añadir UI inline para crear nuevos formatos y eliminar existentes directamente desde el desplegable.

### Cambios

**1. Tabla Supabase `linkedin_format_options`**
- Columnas: `id (uuid)`, `value (text, unique)`, `label (text)`, `created_at`
- RLS: permitir lectura/escritura a usuarios autenticados
- Seed con los 6 formatos actuales (carousel, long_text, infographic, opinion, storytelling, data_highlight)

**2. Hook `useLinkedInFormats` (nuevo fichero)**
- `src/hooks/useLinkedInFormats.ts`
- Query para listar formatos, mutation para crear y eliminar
- Fallback a los 6 formatos hardcoded si la tabla está vacía

**3. `ContentItemDialog.tsx` — Reemplazar Select por componente editable**
- Sustituir el `<Select>` de formato LinkedIn por un Popover/Combobox custom:
  - Lista de formatos existentes (seleccionables)
  - Botón `X` junto a cada formato para eliminarlo (con confirmación)
  - Input al final para "Añadir nuevo formato..." + botón `+`
- Usar el hook `useLinkedInFormats` en lugar del array hardcoded

### Ficheros

| Fichero | Acción |
|---------|--------|
| `src/hooks/useLinkedInFormats.ts` | Crear |
| `src/components/admin/content-calendar/ContentItemDialog.tsx` | Modificar (reemplazar Select por Popover editable) |
| Migration SQL (via Supabase dashboard) | Crear tabla + seed |

