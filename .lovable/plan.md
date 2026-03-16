

## Plan: Añadir columna de Seguimiento al paso de envío de campañas Documento

### Problema
`DocumentSendStep.tsx` (paso de envío para campañas tipo documento) no tiene columna de seguimiento (`seguimiento_estado`). Las campañas de valoración sí la tienen en `CampaignSummaryStep.tsx`, con un selector inline por empresa y filtros.

### Solución
Replicar en `DocumentSendStep.tsx` la misma lógica de seguimiento que ya existe en `CampaignSummaryStep.tsx`:

#### Cambios en `DocumentSendStep.tsx`:

1. **Añadir imports**: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` + `useQueryClient`, `cn`, `useCallback`
2. **Añadir constantes `SEGUIMIENTO_OPTIONS` y `getSeguimientoOption`** (mismas que en CampaignSummaryStep)
3. **Añadir componente `SeguimientoBadge`** inline — selector de estado por empresa que actualiza `valuation_campaign_companies.seguimiento_estado`
4. **Añadir columna "Seguimiento"** en la tabla, entre "Entrega" y "Acciones"
5. **Añadir filtro por seguimiento** en la toolbar (dropdown para filtrar por sin_respuesta/interesado/no_interesado/reunion_agendada)
6. **Añadir stats de seguimiento** en las cards superiores (interesados, reuniones agendadas)

Todos estos elementos ya están implementados en `CampaignSummaryStep.tsx` — se trata de replicar el patrón exacto.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/campanas-valoracion/steps/DocumentSendStep.tsx` | Añadir columna Seguimiento con badge-select, filtro y stats |

