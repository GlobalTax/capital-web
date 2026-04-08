

## Plan: Equiparar el Pipeline de Compras con el de Ventas

### Situacion actual
El pipeline de compras (`BuyPipelineView`) es una versión simplificada con:
- Tarjeta básica inline (sin menú de acciones, sin asignación, sin checkbox)
- Solo filtro de búsqueda
- Sin sistema de emails pre-llamada
- Sin selección masiva ni barra de acciones bulk
- Sin filtros avanzados (asignado, canal, formulario, fecha, facturación, EBITDA)
- Sin visibilidad de columnas ni vistas guardadas
- Sin editor de columnas

El pipeline de ventas (`LeadsPipelineView`) tiene todo lo anterior.

### Que se va a hacer

Traer todas las funcionalidades del pipeline de ventas al de compras, **sin cambiar las fases/columnas** (que siguen usando `contact_statuses`).

### Cambios

**1. `useBuyPipeline.ts` — Ampliar el hook**

- Añadir campos al tipo `BuyPipelineLead`: `assigned_to`, `assigned_at`, `precall_email_sent`, `precall_email_sent_at`, `call_attempts_count`, `last_call_attempt_at`, `revenue`, `ebitda`, `final_valuation`, `location`, `employee_range`, `empresa_id`
- Añadir queries para `adminUsers` (reutilizando la RPC `get_active_admin_users`)
- Añadir mutaciones: `assignLead`, `registerCall`, `updateStatusAsync`
- Mapear los campos desde las 4 tablas de origen

**2. `BuyPipelineView.tsx` — Reescribir con todas las features**

Replicar la estructura completa de `LeadsPipelineView`:
- Reemplazar `BuyPipelineCard` inline por el componente `PipelineCard` compartido (mapeando `BuyPipelineLead` a `PipelineLead` para compatibilidad)
- Añadir sistema de email pre-llamada con 4 variantes + `PrecallEmailPreviewDialog`
- Añadir selección masiva con checkboxes + barra flotante de acciones bulk
- Añadir todos los filtros: asignado (multi), canal (multi), formulario (multi), fecha (con presets), facturación, EBITDA
- Añadir toggle de visibilidad de columnas con guardado de vistas
- Añadir `PipelineColumnsEditor`
- Añadir asignación de leads desde las tarjetas
- Mantener título "Pipeline Compras"

**3. Mapeo de tipos**

Crear una función helper `toBuyPipelineLead()` que mapee `BuyPipelineLead` a `PipelineLead` para poder reutilizar `PipelineCard` y `PipelineColumn` sin duplicar componentes.

### Archivos afectados
- `src/features/leads-pipeline/hooks/useBuyPipeline.ts` — ampliar tipo y mutaciones
- `src/features/leads-pipeline/components/BuyPipelineView.tsx` — reescribir con todas las features

### Lo que NO cambia
- Las fases/columnas del pipeline (siguen usando `contact_statuses`)
- Los componentes compartidos (`PipelineCard`, `PipelineColumn`, `PrecallEmailPreviewDialog`) — se reutilizan tal cual
- El hook `useContactStatuses` — sin cambios

