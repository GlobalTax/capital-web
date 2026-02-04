-- =============================================
-- FIX: Cambiar índice único a permitir duplicados y recrear vista
-- =============================================

-- 1. Eliminar índice único problemático
DROP INDEX IF EXISTS public.idx_ucd_date_campaign_channel;

-- 2. Recrear la vista materializada con agrupación correcta (usando original_campaign_name como clave)
DROP MATERIALIZED VIEW IF EXISTS public.unified_costs_daily;

CREATE MATERIALIZED VIEW public.unified_costs_daily AS
SELECT 
  ach.date,
  c.id as campaign_id,
  COALESCE(c.name, 
    CASE 
      WHEN ach.campaign_name LIKE '%Q4%' THEN 'Q4-API'
      WHEN ach.campaign_name LIKE '%Valoración%' AND ach.campaign_name NOT LIKE '%Q4%' THEN 'Valoración'
      WHEN ach.campaign_name LIKE '%Compra%' THEN 'Compra'
      WHEN ach.campaign_name LIKE '%Venta%' THEN 'Venta'
      ELSE ach.campaign_name
    END
  ) as campaign_name,
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
)
GROUP BY ach.date, c.id, 
         COALESCE(c.name, 
           CASE 
             WHEN ach.campaign_name LIKE '%Q4%' THEN 'Q4-API'
             WHEN ach.campaign_name LIKE '%Valoración%' AND ach.campaign_name NOT LIKE '%Q4%' THEN 'Valoración'
             WHEN ach.campaign_name LIKE '%Compra%' THEN 'Compra'
             WHEN ach.campaign_name LIKE '%Venta%' THEN 'Venta'
             ELSE ach.campaign_name
           END
         ), 
         ach.campaign_name, ach.platform
ORDER BY ach.date DESC;

-- 3. Crear índice único sobre original_campaign_name + date (que sí es único)
CREATE UNIQUE INDEX idx_ucd_date_original_campaign 
  ON public.unified_costs_daily(date, original_campaign_name);
CREATE INDEX idx_ucd_campaign_id ON public.unified_costs_daily(campaign_id);
CREATE INDEX idx_ucd_date ON public.unified_costs_daily(date);
CREATE INDEX idx_ucd_campaign_name ON public.unified_costs_daily(campaign_name);

-- 4. Grant permissions
GRANT SELECT ON public.unified_costs_daily TO authenticated;