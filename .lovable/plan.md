

# Plan: Metricas de Conversion por Canal y Formulario

## Resumen

Anadir una nueva seccion "Conversion por Canal y Formulario" al dashboard de Metricas existente (`LeadMetricsDashboard`), sin modificar nada del codigo ni componentes actuales. Se extiende el hook `useLeadMetrics` para incluir datos de canal y formulario, y se crean 3 nuevos componentes visuales.

## Datos disponibles en BD (verificado)

**Canales** (tabla `acquisition_channels`, campo `acquisition_channel_id` en leads):
- Meta Ads: 321 leads
- Meta ads - Formulario instantaneo: 615 leads
- Google Ads: 27 leads
- Directo, Marketplace, etc.
- NULL (sin canal): ~100 leads

**Formularios** (tabla `lead_forms`, campo `lead_form` en leads):
- form_nov_2025_negocios (display: "Valoracion"): 423 leads
- form_enero_2026_ventas (display: "Ventas"): 50 leads
- form_enero_2025_compra (display: "Compras"): 13 leads
- NULL (sin formulario): ~756 leads

**Estados** (tabla `contact_statuses`, campo `lead_status_crm`):
17 estados ordenados por position. Los relevantes para conversion:
- pos 1: Nuevo (status_key: nuevo)
- pos 4: Primer Contacto (propuesta_enviada)
- pos 2: Target Lead (contactando) = cualificado
- pos 7: Reunion Programada (fase0_activo)
- pos 9: PSH Enviada (archivado)
- pos 11: Ganado
- pos 12-16: Varios estados de perdido

## Definicion de "Conversion" (2 niveles)

Basado en los estados reales del sistema:
- **Nivel A - Contactado**: lead llego a position >= 4 (Primer Contacto o superior, excluyendo terminales perdidos)
- **Nivel B - Cualificado**: lead llego a position >= 6 (Contacto Efectivo o superior, excluyendo terminales perdidos)
- **Nivel C - Avanzado**: lead llego a position >= 7 (Reunion Programada o superior)

Estos niveles se calculan dinamicamente desde `contact_statuses.position`, no hardcodeados.

## Cambios detallados

### 1. Extender hook: `src/components/admin/metrics/useLeadMetrics.ts`

Anadir al fetch de leads el campo `acquisition_channel_id` (ya se consulta la tabla, solo falta incluir el campo en el SELECT).

Anadir al return del hook un nuevo campo `conversionMetrics` que contenga:
- `byChannel`: agrupacion por canal (Meta Ads agrupado, Google Ads, Sin canal, Otros)
  - Para cada canal: total leads, conteo por etapa del funnel, tasas de conversion A/B/C
- `byForm`: agrupacion por formulario (usando `displayNameMap` del hook `useLeadForms`)
  - Para cada formulario: total leads, conteo por etapa, tasas de conversion A/B/C
- `channelTimeSeries`: serie temporal semanal de leads nuevos y cualificados por canal

**Agrupacion de canales**: "Meta Ads" y "Meta ads - Formulario instantaneo" se agrupan bajo "Meta Ads" para la comparativa. "Google Ads" es su propio grupo.

### 2. Nuevo componente: `src/components/admin/metrics/ChannelConversionBlock.tsx`

Seccion "Conversion por Canal" con:
- **KPI cards por canal** (Meta vs Google vs Otros): Total leads, Contact Rate, Qualification Rate
- **Grafico de barras comparativo** (Recharts `BarChart`): tasas de conversion A/B/C por canal, lado a lado
- **Mini-funnel por canal**: conteos por etapa principal (Nuevo -> Contactado -> Cualificado -> Reunion -> Ganado -> Perdido)

### 3. Nuevo componente: `src/components/admin/metrics/FormConversionBlock.tsx`

Seccion "Conversion por Formulario" con:
- **Tabla heatmap** por formulario: filas = formularios (Ventas, Compras, Valoracion, Sin formulario), columnas = etapas del funnel, celdas con conteo y color segun intensidad
- **Barras comparativas** de tasas de conversion por formulario
- Leads "Sin formulario" visibles para limpieza de datos

### 4. Nuevo componente: `src/components/admin/metrics/ChannelEvolutionBlock.tsx`

Serie temporal semanal:
- Lineas por canal (Meta en azul, Google en verde, Otros en gris)
- Toggle entre: leads nuevos vs leads cualificados vs tasa de cualificacion
- Usa Recharts `LineChart` con `ResponsiveContainer`

### 5. Integrar en: `src/components/admin/metrics/LeadMetricsDashboard.tsx`

Despues del bloque existente `TemporalEvolutionBlock`, anadir:
```
<Separator />
<ChannelConversionBlock data={metrics.conversionMetrics.byChannel} ... />
<Separator />
<FormConversionBlock data={metrics.conversionMetrics.byForm} ... />
<Separator />
<ChannelEvolutionBlock data={metrics.conversionMetrics.channelTimeSeries} ... />
```

Cada bloque envuelto en el mismo patron de loading/empty state.

### 6. Invalidacion automatica

Extender `useInlineUpdate.ts` (linea ~437) para invalidar `lead-metrics-data` cuando se cambia `lead_status_crm`:
```ts
queryClient.invalidateQueries({ queryKey: ['lead-metrics-data'] });
```

Tambien anadir la misma invalidacion en:
- `LeadStatusSelect.tsx` (ya invalida otros queries, anadir este)
- `ContactDetailSheet.tsx` (cuando cambia status)

## Archivos a crear

| Archivo | Descripcion |
|---------|-------------|
| `src/components/admin/metrics/ChannelConversionBlock.tsx` | Funnel + KPIs + barras por canal |
| `src/components/admin/metrics/FormConversionBlock.tsx` | Heatmap + barras por formulario |
| `src/components/admin/metrics/ChannelEvolutionBlock.tsx` | Serie temporal por canal |

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/metrics/useLeadMetrics.ts` | Anadir acquisition_channel_id al fetch + calcular conversionMetrics |
| `src/components/admin/metrics/types.ts` | Nuevos tipos para conversion metrics |
| `src/components/admin/metrics/LeadMetricsDashboard.tsx` | Importar + renderizar 3 nuevos bloques |
| `src/components/admin/metrics/index.ts` | Exportar nuevos componentes |
| `src/hooks/useInlineUpdate.ts` | Invalidar lead-metrics-data en status change |
| `src/components/admin/leads/LeadStatusSelect.tsx` | Invalidar lead-metrics-data |

## Lo que NO se toca

- Ninguna tabla de base de datos
- Ningun componente existente de metricas (MetricsKPISummary, StatusDistributionBlock, ConversionFunnelBlock, CampaignQualityBlock, TemporalEvolutionBlock)
- Nada de Meta Ads ni Google Ads
- Nada del tab de Costes, Mapeo
- Ningun endpoint backend
- La logica actual del hook solo se extiende (se anade al return, no se modifica lo existente)

