

## Renombrar Pipeline a "Pipeline Ventas" y crear "Pipeline Compras"

### Resumen
Renombrar el pipeline actual como "Pipeline Ventas" y crear un nuevo "Pipeline Compras" que muestre leads de las tablas `company_acquisition_inquiries` y `acquisition_leads` en formato Kanban, usando el mismo sistema de estados (`contact_statuses`).

### Cambios

#### 1. Renombrar el pipeline actual
- **`LeadsPipelineView.tsx`**: Cambiar título de "Pipeline de Leads" a "Pipeline Ventas"
- **`sidebar-config.ts`**: Renombrar las dos entradas de "Pipeline" / "Pipeline de Leads" a "Pipeline Ventas"

#### 2. Crear hook `useBuyPipeline`
- Nuevo archivo `src/features/leads-pipeline/hooks/useBuyPipeline.ts`
- Fetch de `company_acquisition_inquiries` y `acquisition_leads` (donde `lead_status_crm IS NOT NULL` y `is_deleted = false`)
- Normalizar a una interfaz `BuyPipelineLead` con: `id`, `origin` (acquisition/company_acquisition), `full_name`, `company`, `email`, `phone`, `investment_budget/range`, `sectors_of_interest`, `lead_status_crm`, `created_at`, `notes`, `acquisition_channel_id`, `lead_form`
- Mutations: `updateStatus` y `updateNotes` (sin `assigned_to` ya que estas tablas no lo tienen)
- Agrupar por `lead_status_crm`

#### 3. Crear componente `BuyPipelineView`
- Nuevo archivo `src/features/leads-pipeline/components/BuyPipelineView.tsx`
- Reutilizar `PipelineColumn` existente con una tarjeta simplificada o crear `BuyPipelineCard` minimalista
- Título: "Pipeline Compras"
- Filtros básicos: búsqueda, canal, formulario
- Drag-and-drop para cambiar estados (usa `contact_statuses` compartidos)

#### 4. Crear página `BuyPipelinePage`
- Nuevo archivo `src/pages/admin/BuyPipelinePage.tsx`
- Wrapper simple que renderiza `BuyPipelineView`

#### 5. Registrar ruta y sidebar
- **`LazyAdminComponents.tsx`**: Añadir `LazyBuyPipelinePage`
- **`AdminRouter.tsx`**: Añadir ruta `/buy-pipeline`
- **`sidebar-config.ts`**: Añadir entrada "Pipeline Compras" con icono `ShoppingCart` debajo de "Pipeline Ventas"
- **`AdminSidebar.tsx`**: Añadir `'buy-pipeline': 'dashboard'` al mapa de categorías

### Detalle técnico
- Las tarjetas del pipeline de compras mostrarán: nombre, empresa, presupuesto de inversión, sectores de interés, tipo de adquisición y canal
- Se reutiliza el sistema de columnas de `contact_statuses` (mismo que el pipeline de ventas)
- Click en tarjeta navega a `LeadDetailPage` con prefijo `company_acquisition_` o `acquisition_`
- No incluye `assigned_to` ni funcionalidad de llamadas (estas tablas no tienen esos campos)

### Archivos nuevos (3)
- `src/features/leads-pipeline/hooks/useBuyPipeline.ts`
- `src/features/leads-pipeline/components/BuyPipelineView.tsx`
- `src/pages/admin/BuyPipelinePage.tsx`

### Archivos modificados (4)
- `src/features/leads-pipeline/components/LeadsPipelineView.tsx` — título
- `src/features/admin/config/sidebar-config.ts` — renombrar + nueva entrada
- `src/features/admin/components/LazyAdminComponents.tsx` — lazy import
- `src/features/admin/components/AdminRouter.tsx` — nueva ruta

