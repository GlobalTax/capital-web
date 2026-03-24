

## Mostrar el formulario de origen en las tarjetas del Pipeline

### Problema
El campo `lead_form` ya se carga en cada lead del pipeline, pero no se muestra en la tarjeta. El usuario quiere ver qué formulario rellenó cada lead.

### Cambios

**1. `src/features/leads-pipeline/hooks/useLeadsPipeline.ts`** — Cargar los nombres de formularios
- Añadir una query a `lead_forms` para obtener el mapa `id → display_name`
- Exponer `leadFormsMap` desde el hook

**2. `src/features/leads-pipeline/components/PipelineCard.tsx`** — Mostrar badge con el formulario
- Añadir prop `leadFormName?: string`
- Mostrar un badge debajo de la industria cuando exista, por ejemplo:
  ```
  📋 Valoración Web
  ```
- Añadir `leadFormName` a la comparación del memo

**3. `src/features/leads-pipeline/components/PipelineColumn.tsx`** — Pasar el nombre del formulario a cada tarjeta
- Recibir `leadFormsMap` como prop
- Pasar `leadFormName={leadFormsMap.get(lead.lead_form)}` a cada `PipelineCard`
- Añadir al memo comparison

**4. `src/features/leads-pipeline/components/LeadsPipelineView.tsx`** — Conectar el mapa de formularios
- Obtener `leadFormsMap` del hook o usar `useLeadForms()` directamente
- Pasarlo a cada `PipelineColumn`

### Resultado
Cada tarjeta del pipeline mostrará un badge con el nombre del formulario que rellenó el lead (ej: "Valoración Web", "Contacto", etc.), visible de un vistazo.

