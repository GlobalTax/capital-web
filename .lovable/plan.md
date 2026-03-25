

## Separar leads "Compras" del Pipeline Ventas al Pipeline Compras

### Problema
Actualmente hay 59 leads con `lead_status_crm = 'compras'` en las tablas de ventas (`company_valuations`: 50, `contact_leads`: 9) que aparecen en el Pipeline Ventas. El usuario quiere que estos leads solo aparezcan en el Pipeline Compras.

### Cambios

#### 1. Excluir leads "compras" del Pipeline Ventas
**`src/features/leads-pipeline/hooks/useLeadsPipeline.ts`**
- Añadir filtro `.neq('lead_status_crm', 'compras')` a las queries de `company_valuations` y `contact_leads`

#### 2. Incluir leads "compras" de ventas en Pipeline Compras
**`src/features/leads-pipeline/hooks/useBuyPipeline.ts`**
- Añadir dos queries adicionales para traer leads de `company_valuations` y `contact_leads` donde `lead_status_crm = 'compras'`
- Normalizarlos a `BuyPipelineLead` con `origin: 'valuation_compras'` y `'contact_compras'` respectivamente
- Mapear su `lead_status_crm` de `'compras'` → `'nuevo'`
- Incluirlos en la deduplicación por email y en el resultado final
- Actualizar `getTableName` para manejar los nuevos origins

#### 3. Actualizar tipos
**`src/features/leads-pipeline/hooks/useBuyPipeline.ts`**
- Extender el tipo `origin` de `BuyPipelineLead` para incluir `'valuation_compras' | 'contact_compras'`

### Resultado
- Pipeline Ventas: solo leads de venta (sin etiqueta "compras")
- Pipeline Compras: leads de las 4 tablas (acquisition_leads, company_acquisition_inquiries, + los "compras" de company_valuations y contact_leads)

### Archivos afectados (2)
- `src/features/leads-pipeline/hooks/useLeadsPipeline.ts`
- `src/features/leads-pipeline/hooks/useBuyPipeline.ts`

