

## Plan: Independizar los pipelines de Ventas y Compras

### Problema
Ambos pipelines comparten la misma tabla `contact_statuses` y el mismo componente `PipelineColumnsEditor`. Cuando intentas eliminar o editar una columna desde el pipeline de compras, la validación de borrado cuenta los 64 leads del pipeline de ventas y bloquea la acción.

### Solución
Añadir un campo `pipeline_type` a `contact_statuses` para separar las fases de cada pipeline, y hacer que todos los componentes filtren por tipo.

### Cambios

**1. Migración SQL — Añadir `pipeline_type` a `contact_statuses`**
- Nueva columna `pipeline_type TEXT NOT NULL DEFAULT 'sell'` con CHECK `('sell', 'buy')`
- Todos los estados existentes se quedan como `'sell'`
- Insertar un set inicial de estados para el pipeline de compras (Nuevo, Contactando, En Negociación, Ganado, Perdido — o los que el usuario prefiera; se pueden editar después)

**2. `useContactStatuses.ts` — Aceptar filtro por `pipeline_type`**
- Añadir parámetro opcional `pipelineType: 'sell' | 'buy'` al hook
- Filtrar la query con `.eq('pipeline_type', pipelineType)` cuando se pase
- En `deleteStatusMutation`: si `pipelineType === 'buy'`, comprobar solo `company_acquisition_inquiries` y `acquisition_leads`; si `'sell'`, comprobar solo `contact_leads` y `company_valuations`

**3. `useLeadPipelineColumns.ts` — Pasar `pipelineType` al hook interno**
- Aceptar `pipelineType` como parámetro y pasarlo a `useContactStatuses`

**4. `PipelineColumnsEditor.tsx` — Aceptar prop `pipelineType`**
- Pasar `pipelineType` a `useLeadPipelineColumns`

**5. `LeadsPipelineView.tsx` — Pasar `pipelineType="sell"`**
- Al usar `useContactStatuses` y `PipelineColumnsEditor`, pasar `'sell'`

**6. `BuyPipelineView.tsx` — Pasar `pipelineType="buy"`**
- Al usar `useContactStatuses` y `PipelineColumnsEditor`, pasar `'buy'`

### Archivos afectados
- Migración SQL (nueva)
- `src/hooks/useContactStatuses.ts`
- `src/features/leads-pipeline/hooks/useLeadPipelineColumns.ts`
- `src/features/leads-pipeline/components/PipelineColumnsEditor.tsx`
- `src/features/leads-pipeline/components/LeadsPipelineView.tsx`
- `src/features/leads-pipeline/components/BuyPipelineView.tsx`

### Resultado
Cada pipeline tendrá sus propias columnas independientes. Editar, crear o eliminar fases en uno no afectará al otro.

