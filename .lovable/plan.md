

# Plan: Vincular Costes con Leads Reales para CPL Real

## Situación Actual

### Lo Que Ya Tenemos (Implementado)

| Componente | Estado | Función |
|------------|--------|---------|
| `campaign_leads_mapping` | Tabla creada | 4 mappings configurados (Q4-API, Valoración, Compra, Venta) |
| `unified_costs_daily` | Vista materializada | Agrega costes diarios por campaña |
| `campaign_leads_stats` | Vista | Calcula leads reales por campaña y fecha |
| `useUnifiedCosts` | Hook funcional | Combina costes + leads, calcula CPL real |
| `useCampaignMapping` | Hook funcional | CRUD para mappings |
| `CampaignMappingPanel` | Componente UI | Panel de gestión de mappings |

### CPL Real Ya Calculado en Base de Datos

| Campaña | Gasto Total | Resultados Meta | Leads Reales | CPL Meta | CPL Real | CPL Calificado |
|---------|-------------|-----------------|--------------|----------|----------|----------------|
| Q4-API | €4,621 | 207 | 262 | €22.33 | €17.64 | €18.94 |
| Valoración | €4,497 | 619 | 261 | €7.26 | €17.23 | €18.43 |
| Compra | €788 | 39 | 13 | €20.21 | €60.63 | — |
| Venta | €735 | 77 | 48 | €9.54 | €15.31 | €23.70 |

### Lo Que Falta: Integración en UI

El dashboard `MetaAdsAnalyticsDashboard` todavía usa:
- `useAdsCostsHistory` (costes brutos de Excel)
- No muestra leads reales ni CPL real
- No consume `useUnifiedCosts`

---

## Cambios Propuestos

### 1. Extender Tipos de Meta Ads Analytics

Añadir campos de leads reales a `GlobalStats` y `CampaignStats`:

```typescript
// src/components/admin/campaigns/MetaAdsAnalytics/types.ts

export interface GlobalStats {
  // Existentes...
  totalSpend: number;
  totalResults: number;
  avgCostPerResult: number;
  
  // NUEVOS - Leads Reales
  totalRealLeads: number;
  totalQualifiedLeads: number;
  realCPL: number | null;
  qualifiedCPL: number | null;
  avgEbitda: number | null;
}

export interface CampaignStats {
  // Existentes...
  campaignName: string;
  totalSpend: number;
  totalResults: number;
  avgCostPerResult: number;
  
  // NUEVOS - Leads Reales
  totalRealLeads: number;
  totalQualifiedLeads: number;
  realCPL: number | null;
  qualifiedCPL: number | null;
  avgEbitda: number | null;
}
```

### 2. Actualizar MetaAdsAnalyticsDashboard

Cambiar de `useAdsCostsHistory` a `useUnifiedCosts`:

```typescript
// ANTES
const { data: records, isLoading } = useAdsCostsHistory('meta_ads');

// DESPUÉS
const { 
  costWithLeads,      // Costes + leads combinados
  campaignSummaries,  // Ya tiene realCPL calculado
  globalStats,        // Ya tiene totalRealLeads
  isLoading 
} = useUnifiedCosts({ channel: 'meta_ads' });
```

### 3. Actualizar GlobalKPIs

Añadir 3 nuevas tarjetas de KPIs:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RESUMEN GLOBAL                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ €10,641  │  │ 108 días │  │ 942      │  │ 1.4M     │  │ 2.1x     │      │
│  │ Gasto    │  │ Activos  │  │ Resultados│ │ Impress. │  │ Frecuencia│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │              LEADS REALES (NUEVO)                                    │   │
│  ├──────────┬──────────┬──────────┬──────────┐                          │   │
│  │ 584      │ 517      │ €18.22   │ €20.58   │                          │   │
│  │ Leads    │ Calificad│ CPL Real │ CPL Calif│                          │   │
│  │ Reales   │ ados     │          │          │                          │   │
│  └──────────┴──────────┴──────────┴──────────┘                          │   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4. Actualizar CampaignCard

Añadir columna "Leads Reales" y "CPL Real" en cada tarjeta:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Q4-API                                              18.7% del total        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ €4,621   │  │ 207      │  │ €22.33   │  │ €7.27    │                    │
│  │ Gasto    │  │ Resultados│ │ Coste/Res│  │ CPM      │                    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────┐  NUEVO           │
│  │  LEADS REALES                                        │                   │
│  ├──────────┬──────────┬──────────┬──────────┐          │                   │
│  │ 262      │ 244      │ €17.64   │ €18.94   │          │                   │
│  │ Leads    │ Calif.   │ CPL Real │ CPL Calif│          │                   │
│  └──────────┴──────────┴──────────┴──────────┘          │                   │
│                                                                             │
│  [▼ Ver detalle diario]                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5. Componente de Comparación CPL

Nuevo componente visual que muestre la diferencia entre CPL Meta vs CPL Real:

```typescript
// src/components/admin/campaigns/MetaAdsAnalytics/CPLComparison.tsx

// Muestra un gráfico de barras comparando:
// - CPL reportado por Meta (resultados de la plataforma)
// - CPL Real (leads en nuestra base de datos)
// - CPL Calificado (leads que llegaron a reunión)
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `MetaAdsAnalytics/types.ts` | Añadir campos leads/CPL a interfaces |
| `MetaAdsAnalytics/MetaAdsAnalyticsDashboard.tsx` | Usar `useUnifiedCosts` en lugar de `useAdsCostsHistory` |
| `MetaAdsAnalytics/GlobalKPIs.tsx` | Añadir sección "Leads Reales" con 4 KPIs nuevos |
| `MetaAdsAnalytics/CampaignCard.tsx` | Añadir fila de métricas de leads reales |
| `MetaAdsAnalytics/CPLComparison.tsx` | **Nuevo** - Gráfico comparativo CPL Meta vs Real |

---

## Detalles Técnicos

### Mapeo Actual en Base de Datos

Los 4 mappings configurados:

| Campaña | lead_form_pattern | campaign_name_pattern |
|---------|-------------------|----------------------|
| Q4-API | `form_nov_2025%` | `%Q4%` |
| Valoración | `form_nov_2025_negocios` | `%Valoración%` |
| Compra | `form_enero_2025_compra` | `%Compra%` |
| Venta | `form_enero_2026_ventas` | `%Venta%` |

### Flujo de Datos

```text
ads_costs_history (216 registros)
        │
        ▼
┌───────────────────────────────────────┐
│   unified_costs_daily (vista mat.)    │
│   - Agrupa por fecha + campaña        │
│   - JOIN con campaigns via external_name
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│   campaign_leads_stats (vista)        │
│   - JOIN company_valuations via       │
│     lead_form LIKE pattern            │
│   - Cuenta leads + calificados        │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│   useUnifiedCosts (hook)              │
│   - Combina costes + leads            │
│   - Calcula CPL real por registro     │
│   - Agrupa en campaignSummaries       │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│   MetaAdsAnalyticsDashboard (UI)      │
│   - Muestra GlobalKPIs con leads      │
│   - Muestra CampaignCards con CPL real│
│   - Añade CPLComparison chart         │
└───────────────────────────────────────┘
```

---

## Beneficios

1. **Visibilidad Real**: Ver cuántos leads reales generó cada campaña (no solo "resultados" de Meta)
2. **CPL Comparativo**: Comparar lo que Meta reporta vs lo que realmente llegó a la base de datos
3. **Calidad de Leads**: Ver CPL de leads calificados (los que avanzan en el funnel)
4. **EBITDA Promedio**: Ver el valor potencial de los leads por campaña
5. **Decisiones Informadas**: Optimizar presupuesto basándose en datos reales, no en métricas de plataforma

---

## Resumen de Implementación

| Paso | Descripción | Complejidad |
|------|-------------|-------------|
| 1 | Extender tipos con campos de leads | Baja |
| 2 | Refactorizar Dashboard para usar useUnifiedCosts | Media |
| 3 | Actualizar GlobalKPIs con sección de leads | Baja |
| 4 | Actualizar CampaignCard con métricas de leads | Baja |
| 5 | Crear CPLComparison chart (opcional) | Media |

