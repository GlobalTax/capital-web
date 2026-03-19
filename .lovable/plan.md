

## Guardar plantillas de presentación en base de datos

### Resumen
Persistir las plantillas del editor visual en Supabase para que los cambios se guarden sin necesidad de generar la presentación. Al abrir el modal, se carga la plantilla guardada; al editarla, se guarda automáticamente (o con botón).

### Cambios

**1. Nueva tabla `slide_templates` (migración SQL)**
```sql
create table public.slide_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Default',
  template_data jsonb not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);
alter table public.slide_templates enable row level security;
create policy "Authenticated users can manage templates"
  on public.slide_templates for all to authenticated using (true) with check (true);
```

**2. Hook `useSlideTemplates.ts`**
- `loadDefault()`: Fetch la plantilla marcada como `is_default` o la primera disponible
- `save(template, name?)`: Upsert en la tabla (insert o update)
- `list()`: Listar todas las plantillas guardadas
- Estados: `isLoading`, `isSaving`, `savedTemplate`

**3. Actualizar `GenerateDealhubModal.tsx`**
- Al abrir el modal, cargar la plantilla guardada con el hook
- Añadir botón "Guardar plantilla" en el footer (junto a Cancelar y Generar)
- El botón guarda el `fullTemplate` actual en la BD
- Feedback visual con toast "Plantilla guardada"

**4. Actualizar `SlideTemplateEditor.tsx`** (opcional)
- Mostrar indicador de "sin guardar" si hay cambios respecto a la última versión guardada

### Archivos
| Archivo | Cambio |
|---------|--------|
| Migración SQL | Crear tabla `slide_templates` |
| `src/features/operations-management/hooks/useSlideTemplates.ts` | Nuevo hook CRUD |
| `src/features/operations-management/components/GenerateDealhubModal.tsx` | Cargar/guardar plantilla, botón "Guardar" |

