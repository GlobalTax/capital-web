
# Plan: Consolidación del Sistema de Costes Publicitarios

## Diagnóstico Actual

### Los 3 Sistemas Desconectados

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ESTADO ACTUAL                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐      ┌─────────────────────┐      ┌────────────┐   │
│  │  1. REGISTRO MANUAL │      │ 2. IMPORTACIÓN ADS  │      │ 3. LEADS   │   │
│  │                     │      │                     │      │            │   │
│  │  campaigns          │      │  ads_costs_history  │      │ company_   │   │
│  │  campaign_cost_     │      │  (216 registros)    │      │ valuations │   │
│  │  snapshots (vacía)  │      │                     │      │            │   │
│  └──────────┬──────────┘      └──────────┬──────────┘      └─────┬──────┘   │
│             │                            │                       │          │
│             ▼                            ▼                       ▼          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      SIN CONEXION                                    │   │
│  │  - No hay FK entre ads_costs_history y campaigns                     │   │
│  │  - No hay mapeo lead_form <-> campaign_name                          │   │
│  │  - useLeadMetrics no accede a costes reales                          │   │
│  │  - useContactsCostAnalysis usa campaign_costs (tabla vacía!)         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Datos Reales en Base de Datos

| Tabla | Registros | Uso Actual |
|-------|-----------|------------|
| `ads_costs_history` | 216 | Importación Meta Ads con €10,641 |
| `campaigns` | 2 (duplicados) | Registro manual (sin snapshots) |
| `campaign_cost_snapshots` | 0 | Vacía |
| `campaign_costs` | 0 | Vacía (pero useCampaignCosts la consulta!) |
| `campaign_cost_history` | 0 | Auditoría sin trigger activo |

### Campañas en `ads_costs_history` (reales)
- `Valoración de empresas Q4 - API + navegador`: €4,621
- `Generación clientes potenciales (Valoración)`: €4,497
- `Generación clientes potenciales - Compra`: €788
- `Generación clientes potenciales - Venta`: €735

### Lead Forms en `company_valuations` (reales)
- `form_nov_2025_negocios`: 261 leads
- `form_enero_2026_ventas`: 48 leads
- `form_enero_2025_compra`: 13 leads

---

## Solución Propuesta: Modelo Unificado

### Nueva Arquitectura

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SISTEMA UNIFICADO                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    TABLA PRINCIPAL: campaigns                        │   │
│  │  - Dimensiones de campaña (nombre, canal, estado)                    │   │
│  │  - FK opcional: external_campaign_id (para vincular con Meta/Google) │   │
│  │  - lead_form_pattern: regex para matching con leads                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│           ┌────────────────────────┼────────────────────────┐              │
│           ▼                        ▼                        ▼              │
│  ┌─────────────────┐   ┌────────────────────┐   ┌──────────────────────┐   │
│  │ ads_costs_      │   │ campaign_leads_    │   │ unified_costs_view   │   │
│  │ history         │   │ mapping            │   │ (Materialized View)  │   │
│  │                 │   │                    │   │                      │   │
│  │ campaign_id FK  │◄──│ campaign_id        │──►│ date, campaign,      │   │
│  │ date, spend     │   │ lead_form          │   │ spend, leads, CPL    │   │
│  └─────────────────┘   │ campaign_name_pat  │   └──────────────────────┘   │
│                        └────────────────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cambios de Base de Datos

### 1. Nueva Tabla: `campaign_leads_mapping`

```sql
CREATE TABLE campaign_leads_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Patrones de matching (uno u otro)
  lead_form_pattern TEXT,           -- e.g., 'form_nov_2025%' o 'form_%_ventas'
  campaign_name_pattern TEXT,       -- e.g., 'Valoración%' o '%Venta%'
  utm_campaign_pattern TEXT,        -- Para matching con UTM params
  
  -- Prioridad para resolver conflictos
  priority INTEGER DEFAULT 10,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Índices para búsqueda rápida
CREATE INDEX idx_clm_lead_form ON campaign_leads_mapping(lead_form_pattern) 
  WHERE lead_form_pattern IS NOT NULL;
CREATE INDEX idx_clm_campaign_name ON campaign_leads_mapping(campaign_name_pattern) 
  WHERE campaign_name_pattern IS NOT NULL;
```

### 2. Modificar tabla `campaigns`

```sql
-- Añadir columna para vincular con nombre de Meta Ads
ALTER TABLE campaigns 
  ADD COLUMN external_name TEXT,           -- Nombre exacto en Meta Ads
  ADD COLUMN external_campaign_id TEXT,    -- ID de campaña en Meta/Google
  ADD COLUMN default_lead_form TEXT;       -- Lead form principal asociado

-- Índice para join con ads_costs_history
CREATE INDEX idx_campaigns_external_name ON campaigns(external_name);
```

### 3. Modificar tabla `ads_costs_history`

```sql
-- Añadir FK a campaigns (nullable para compatibilidad)
ALTER TABLE ads_costs_history 
  ADD COLUMN linked_campaign_id UUID REFERENCES campaigns(id);

-- Índice para joins
CREATE INDEX idx_ach_linked_campaign ON ads_costs_history(linked_campaign_id);
```

### 4. Vista Materializada: `unified_costs_daily`

```sql
CREATE MATERIALIZED VIEW unified_costs_daily AS
SELECT 
  ach.date,
  COALESCE(c.id, ach.linked_campaign_id) as campaign_id,
  COALESCE(c.name, ach.campaign_name) as campaign_name,
  ach.platform as channel,
  SUM(ach.spend) as spend,
  SUM(ach.results) as results,
  SUM(ach.impressions) as impressions,
  SUM(ach.reach) as reach,
  CASE WHEN SUM(ach.results) > 0 
    THEN SUM(ach.spend) / SUM(ach.results) 
    ELSE NULL 
  END as cpl
FROM ads_costs_history ach
LEFT JOIN campaigns c ON (
  ach.linked_campaign_id = c.id 
  OR ach.campaign_name = c.external_name
  OR ach.campaign_name ILIKE '%' || c.name || '%'
)
GROUP BY ach.date, COALESCE(c.id, ach.linked_campaign_id), 
         COALESCE(c.name, ach.campaign_name), ach.platform
ORDER BY ach.date DESC;

-- Índices para la vista
CREATE UNIQUE INDEX idx_ucd_date_campaign ON unified_costs_daily(date, campaign_name);
CREATE INDEX idx_ucd_campaign_id ON unified_costs_daily(campaign_id);

-- Política de refresh
CREATE OR REPLACE FUNCTION refresh_unified_costs()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY unified_costs_daily;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_costs_on_insert
AFTER INSERT OR UPDATE ON ads_costs_history
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_unified_costs();
```

### 5. Vista: `campaign_leads_stats`

```sql
CREATE OR REPLACE VIEW campaign_leads_stats AS
SELECT 
  m.campaign_id,
  c.name as campaign_name,
  DATE(COALESCE(v.lead_received_at, v.created_at)) as lead_date,
  COUNT(v.id) as lead_count,
  COUNT(CASE WHEN v.lead_status_crm IN ('calificado', 'reunión_programada', 'fase0_activo') 
        THEN 1 END) as qualified_count,
  AVG(v.ebitda) as avg_ebitda
FROM campaign_leads_mapping m
JOIN campaigns c ON c.id = m.campaign_id
LEFT JOIN company_valuations v ON (
  v.lead_form ILIKE m.lead_form_pattern
  OR v.last_campaign_name ILIKE m.campaign_name_pattern
)
WHERE v.is_deleted = false
GROUP BY m.campaign_id, c.name, DATE(COALESCE(v.lead_received_at, v.created_at));
```

---

## Migración de Datos Existentes

### Script de Migración

```sql
-- 1. Limpiar duplicados en campaigns
DELETE FROM campaigns 
WHERE id NOT IN (
  SELECT MIN(id) FROM campaigns GROUP BY name, channel
);

-- 2. Poblar external_name con nombres reales de Meta
UPDATE campaigns SET external_name = 'Generación clientes potenciales - Venta'
WHERE name = 'Campaña Venta';

-- 3. Crear campañas faltantes desde ads_costs_history
INSERT INTO campaigns (name, external_name, channel, delivery_status)
SELECT DISTINCT 
  CASE 
    WHEN campaign_name LIKE '%Valoración%' THEN 'Valoración'
    WHEN campaign_name LIKE '%Compra%' THEN 'Compra'
    WHEN campaign_name LIKE '%Venta%' THEN 'Venta'
    WHEN campaign_name LIKE '%Q4%' THEN 'Q4-API'
    ELSE campaign_name
  END as name,
  campaign_name as external_name,
  platform as channel,
  'active'
FROM ads_costs_history ach
WHERE NOT EXISTS (
  SELECT 1 FROM campaigns c 
  WHERE c.external_name = ach.campaign_name
);

-- 4. Vincular ads_costs_history con campaigns
UPDATE ads_costs_history ach
SET linked_campaign_id = c.id
FROM campaigns c
WHERE ach.campaign_name = c.external_name
  AND ach.linked_campaign_id IS NULL;

-- 5. Poblar campaign_leads_mapping
INSERT INTO campaign_leads_mapping (campaign_id, lead_form_pattern, campaign_name_pattern)
SELECT 
  c.id,
  CASE c.name
    WHEN 'Valoración' THEN 'form_nov_2025_negocios'
    WHEN 'Venta' THEN 'form_enero_2026_ventas'
    WHEN 'Compra' THEN 'form_enero_2025_compra'
  END,
  CASE c.name
    WHEN 'Valoración' THEN '%Valoración%'
    WHEN 'Venta' THEN '%Venta%'
    WHEN 'Compra' THEN '%Compra%'
  END
FROM campaigns c
WHERE c.name IN ('Valoración', 'Venta', 'Compra', 'Q4-API');
```

---

## Cambios en Frontend

### 1. Nuevo Hook: `useUnifiedCosts`

```typescript
// src/hooks/useUnifiedCosts.ts
// Reemplaza useCampaignCosts y useAdsCostsHistory para análisis

export const useUnifiedCosts = (options?: UnifiedCostsOptions) => {
  // Query a unified_costs_daily (vista materializada)
  const { data: dailyCosts } = useQuery({
    queryKey: ['unified-costs', options?.dateFrom, options?.dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_costs_daily')
        .select('*')
        .gte('date', options?.dateFrom)
        .lte('date', options?.dateTo)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  // Query a campaign_leads_stats para CPL real
  const { data: leadStats } = useQuery({
    queryKey: ['campaign-leads-stats', options?.dateFrom, options?.dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_leads_stats')
        .select('*')
        .gte('lead_date', options?.dateFrom)
        .lte('lead_date', options?.dateTo);
      
      if (error) throw error;
      return data;
    }
  });
  
  // Combinar costes con leads para CPL real
  const costWithLeads = useMemo(() => {
    if (!dailyCosts || !leadStats) return [];
    
    return dailyCosts.map(cost => {
      const leads = leadStats.find(
        l => l.campaign_id === cost.campaign_id && l.lead_date === cost.date
      );
      return {
        ...cost,
        leads: leads?.lead_count || 0,
        qualifiedLeads: leads?.qualified_count || 0,
        realCPL: leads?.lead_count > 0 
          ? cost.spend / leads.lead_count 
          : null,
        qualifiedCPL: leads?.qualified_count > 0 
          ? cost.spend / leads.qualified_count 
          : null,
      };
    });
  }, [dailyCosts, leadStats]);
  
  return { costWithLeads, isLoading, ... };
};
```

### 2. Refactorizar `useContactsCostAnalysis`

Actualizar para usar `unified_costs_daily` en lugar de `campaign_costs` (tabla vacía).

### 3. Refactorizar `LeadMetricsDashboard`

Añadir sección de "Coste por Lead" que consuma `useUnifiedCosts`.

### 4. Actualizar `MetaAdsAnalyticsDashboard`

Añadir columna de "Leads Reales" vinculando con `campaign_leads_stats`.

---

## Componente: Panel de Mapeo de Campañas

Nuevo componente admin para gestionar el mapeo:

```typescript
// src/components/admin/campaigns/CampaignMappingPanel.tsx
// UI para:
// 1. Ver campañas de ads_costs_history sin vincular
// 2. Crear/editar mappings en campaign_leads_mapping
// 3. Previsualizar leads que matchean cada patrón
```

---

## Resumen de Archivos a Modificar

### Base de Datos (Migraciones)

| Cambio | Tipo |
|--------|------|
| Crear tabla `campaign_leads_mapping` | CREATE TABLE |
| Modificar `campaigns` (3 columnas) | ALTER TABLE |
| Modificar `ads_costs_history` (1 columna) | ALTER TABLE |
| Crear vista `unified_costs_daily` | CREATE MATERIALIZED VIEW |
| Crear vista `campaign_leads_stats` | CREATE VIEW |
| Script migración de datos | INSERT/UPDATE |

### Frontend

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useUnifiedCosts.ts` | **Nuevo** - Hook unificado |
| `src/hooks/useCampaignMapping.ts` | **Nuevo** - CRUD mappings |
| `src/features/contacts/hooks/useContactsCostAnalysis.ts` | Refactorizar a usar unified_costs |
| `src/components/admin/metrics/LeadMetricsDashboard.tsx` | Añadir bloque de costes |
| `src/components/admin/campaigns/MetaAdsAnalyticsDashboard.tsx` | Vincular leads reales |
| `src/components/admin/campaigns/CampaignMappingPanel.tsx` | **Nuevo** - UI de mapeo |
| `src/features/contacts/components/stats/ContactsStatsPanel.tsx` | Actualizar tabs |

---

## Beneficios del Sistema Unificado

1. **CPL Real**: Coste por Lead calculado con leads reales vinculados
2. **Un único punto de verdad**: `unified_costs_daily` combina todas las fuentes
3. **Flexibilidad de Mapeo**: Patrones regex permiten vincular leads históricos
4. **Performance**: Vista materializada con refresh automático
5. **Retrocompatibilidad**: Importación Excel sigue funcionando igual
6. **Auditoría**: Histórico de cambios vía trigger existente

