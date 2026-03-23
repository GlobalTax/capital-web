

## Pipeline: abrir perfil GoDeal + auto-vincular contact_leads a empresa

### Cambios

**1. Añadir `empresa_id` al pipeline**

- **`src/features/leads-pipeline/types/index.ts`**: Añadir `empresa_id: string | null` a `PipelineLead`
- **`src/features/leads-pipeline/hooks/useLeadsPipeline.ts`**: Añadir `empresa_id` a los SELECT de ambas tablas (company_valuations y contact_leads)

**2. Cambiar navegación al clicar tarjeta**

- **`src/features/leads-pipeline/components/LeadsPipelineView.tsx`**: En `handleViewDetails`, si el lead tiene `empresa_id`, abrir `https://godeal.es/empresas/${empresa_id}` en nueva pestaña. Si no tiene empresa vinculada, seguir abriendo el LeadDetailPage como fallback.

**3. Trigger SQL: auto-vincular contact_leads a empresa (igual que company_valuations)**

- **Migración SQL**: Crear trigger `BEFORE INSERT` en `contact_leads` que:
  1. Busque empresa existente por nombre normalizado (case-insensitive)
  2. Si no existe, cree una nueva empresa con los datos disponibles
  3. Asigne `empresa_id` al contact_lead
  
- **Backfill**: UPDATE masivo para vincular contact_leads existentes sin `empresa_id` a empresas por nombre

### Resultado
- Clic en tarjeta del pipeline → abre perfil GoDeal de la empresa
- Todos los contact_leads se vinculan automáticamente a su empresa (como ya hacen los valuations)

