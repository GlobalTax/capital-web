

## Añadir filtros de Contactos al Pipeline

### Resumen
Replicar los filtros de la pestaña "Todos" (Canal, Formulario, Fecha, Facturación, EBITDA) en la barra de filtros del Pipeline, además de los ya existentes (búsqueda y asignado).

### Cambios

**1. `useLeadsPipeline.ts`** — Añadir campos al query
- Incluir `acquisition_channel_id` y `lead_form` en el select de `company_valuations`

**2. `types/index.ts`** — Ampliar `PipelineLead`
- Añadir `acquisition_channel_id: string | null` y `lead_form: string | null`

**3. `LeadsPipelineView.tsx`** — Añadir filtros
- Importar los mismos hooks: `useAcquisitionChannels`, `useLeadForms`
- Añadir estados: `filterChannel`, `filterForm`, `filterRevenueMin/Max`, `filterEbitdaMin/Max`, `filterDateFrom/To`
- Añadir los mismos DropdownMenu/Popover de `ContactsFilters` (Canal, Formulario, Fecha, Facturación, EBITDA) adaptados al estilo compacto
- Aplicar los filtros en el `filteredLeadsByStatus` memo existente
- Actualizar `clearFilters` para resetear todos

### Filtros a añadir (mismo UX que ContactsFilters)
| Filtro | Componente | Datos |
|--------|-----------|-------|
| Canal | DropdownMenu | `useAcquisitionChannels` |
| Formulario | DropdownMenu | `useLeadForms` (displayNameGroups) |
| Fecha | Popover con presets + calendarios | created_at del lead |
| Facturación | Popover con presets + inputs min/max | revenue |
| EBITDA | Popover con presets + inputs min/max | ebitda |

### Archivos a modificar
- `src/features/leads-pipeline/types/index.ts`
- `src/features/leads-pipeline/hooks/useLeadsPipeline.ts`
- `src/features/leads-pipeline/components/LeadsPipelineView.tsx`

