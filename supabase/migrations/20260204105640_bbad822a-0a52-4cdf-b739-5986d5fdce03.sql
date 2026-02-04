-- =============================================
-- CONSOLIDACIÓN DEL SISTEMA DE COSTES PUBLICITARIOS
-- =============================================

-- 1. NUEVA TABLA: campaign_leads_mapping
-- Vincula campañas con patrones de leads
CREATE TABLE IF NOT EXISTS public.campaign_leads_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Patrones de matching (uno u otro)
  lead_form_pattern TEXT,           -- e.g., 'form_nov_2025%' o 'form_%_ventas'
  campaign_name_pattern TEXT,       -- e.g., 'Valoración%' o '%Venta%'
  utm_campaign_pattern TEXT,        -- Para matching con UTM params
  
  -- Prioridad para resolver conflictos
  priority INTEGER DEFAULT 10,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_clm_lead_form ON public.campaign_leads_mapping(lead_form_pattern) 
  WHERE lead_form_pattern IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clm_campaign_name ON public.campaign_leads_mapping(campaign_name_pattern) 
  WHERE campaign_name_pattern IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clm_campaign_id ON public.campaign_leads_mapping(campaign_id);

-- RLS para campaign_leads_mapping
ALTER TABLE public.campaign_leads_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage campaign mappings"
ON public.campaign_leads_mapping
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- 2. MODIFICAR TABLA campaigns
-- Añadir columnas para vincular con Meta Ads
ALTER TABLE public.campaigns 
  ADD COLUMN IF NOT EXISTS external_name TEXT,
  ADD COLUMN IF NOT EXISTS external_campaign_id TEXT,
  ADD COLUMN IF NOT EXISTS default_lead_form TEXT;

-- Índice para join con ads_costs_history
CREATE INDEX IF NOT EXISTS idx_campaigns_external_name ON public.campaigns(external_name);

-- 3. MODIFICAR TABLA ads_costs_history
-- Añadir FK a campaigns (nullable para compatibilidad)
ALTER TABLE public.ads_costs_history 
  ADD COLUMN IF NOT EXISTS linked_campaign_id UUID REFERENCES public.campaigns(id);

-- Índice para joins
CREATE INDEX IF NOT EXISTS idx_ach_linked_campaign ON public.ads_costs_history(linked_campaign_id);

-- 4. VISTA MATERIALIZADA: unified_costs_daily
-- Combina todas las fuentes de costes
DROP MATERIALIZED VIEW IF EXISTS public.unified_costs_daily;

CREATE MATERIALIZED VIEW public.unified_costs_daily AS
SELECT 
  ach.date,
  COALESCE(c.id, ach.linked_campaign_id) as campaign_id,
  COALESCE(c.name, ach.campaign_name) as campaign_name,
  ach.campaign_name as original_campaign_name,
  ach.platform as channel,
  SUM(ach.spend) as spend,
  SUM(COALESCE(ach.results, 0)) as results,
  SUM(COALESCE(ach.impressions, 0)) as impressions,
  SUM(COALESCE(ach.reach, 0)) as reach,
  SUM(COALESCE(ach.clicks, 0)) as clicks,
  CASE WHEN SUM(COALESCE(ach.results, 0)) > 0 
    THEN ROUND((SUM(ach.spend) / SUM(ach.results))::numeric, 2)
    ELSE NULL 
  END as cost_per_result
FROM public.ads_costs_history ach
LEFT JOIN public.campaigns c ON (
  ach.linked_campaign_id = c.id 
  OR ach.campaign_name = c.external_name
  OR (c.external_name IS NOT NULL AND ach.campaign_name ILIKE '%' || c.name || '%')
)
GROUP BY ach.date, COALESCE(c.id, ach.linked_campaign_id), 
         COALESCE(c.name, ach.campaign_name), ach.campaign_name, ach.platform
ORDER BY ach.date DESC;

-- Índices para la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_ucd_date_campaign_channel 
  ON public.unified_costs_daily(date, campaign_name, channel);
CREATE INDEX IF NOT EXISTS idx_ucd_campaign_id ON public.unified_costs_daily(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ucd_date ON public.unified_costs_daily(date);

-- 5. VISTA: campaign_leads_stats
-- Estadísticas de leads por campaña
DROP VIEW IF EXISTS public.campaign_leads_stats;

CREATE OR REPLACE VIEW public.campaign_leads_stats AS
SELECT 
  m.campaign_id,
  c.name as campaign_name,
  DATE(COALESCE(v.lead_received_at, v.created_at)) as lead_date,
  COUNT(v.id) as lead_count,
  COUNT(CASE WHEN v.lead_status_crm IN ('calificado', 'reunión_programada', 'fase0_activo') 
        THEN 1 END) as qualified_count,
  ROUND(AVG(NULLIF(v.ebitda, 0))::numeric, 0) as avg_ebitda,
  ROUND(AVG(NULLIF(v.revenue, 0))::numeric, 0) as avg_revenue
FROM public.campaign_leads_mapping m
JOIN public.campaigns c ON c.id = m.campaign_id
LEFT JOIN public.company_valuations v ON (
  (m.lead_form_pattern IS NOT NULL AND v.lead_form ILIKE m.lead_form_pattern)
  OR (m.campaign_name_pattern IS NOT NULL AND v.last_campaign_name ILIKE m.campaign_name_pattern)
)
WHERE m.is_active = true
  AND (v.is_deleted = false OR v.is_deleted IS NULL)
GROUP BY m.campaign_id, c.name, DATE(COALESCE(v.lead_received_at, v.created_at));

-- 6. FUNCIÓN PARA REFRESCAR VISTA MATERIALIZADA
CREATE OR REPLACE FUNCTION public.refresh_unified_costs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.unified_costs_daily;
END;
$$;

-- 7. TRIGGER PARA ACTUALIZAR updated_at en campaign_leads_mapping
CREATE OR REPLACE FUNCTION public.update_campaign_leads_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_campaign_leads_mapping_updated_at ON public.campaign_leads_mapping;
CREATE TRIGGER trg_campaign_leads_mapping_updated_at
  BEFORE UPDATE ON public.campaign_leads_mapping
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_leads_mapping_updated_at();

-- 8. GRANT PERMISSIONS
GRANT SELECT ON public.unified_costs_daily TO authenticated;
GRANT SELECT ON public.campaign_leads_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_unified_costs() TO authenticated;