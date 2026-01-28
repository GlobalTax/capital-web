-- Añadir campos adicionales de Meta Ads
ALTER TABLE public.ads_costs_history 
ADD COLUMN IF NOT EXISTS result_type TEXT,
ADD COLUMN IF NOT EXISTS results NUMERIC,
ADD COLUMN IF NOT EXISTS cost_per_result NUMERIC(12, 4),
ADD COLUMN IF NOT EXISTS reach BIGINT,
ADD COLUMN IF NOT EXISTS frequency NUMERIC(8, 4),
ADD COLUMN IF NOT EXISTS cpm NUMERIC(12, 4),
ADD COLUMN IF NOT EXISTS link_clicks BIGINT;

-- Renombrar column spend a spend para consistencia (ya existe, solo aseguramos nombre correcto)
-- La columna spend ya existe como spend (EUR), la reutilizamos

-- Crear índice único para evitar duplicados (UPSERT)
-- Si ya existe un registro con misma plataforma + campaña + fecha, lo actualizamos
CREATE UNIQUE INDEX IF NOT EXISTS idx_ads_costs_unique_entry 
ON public.ads_costs_history(platform, campaign_name, date);

-- Comentarios
COMMENT ON COLUMN public.ads_costs_history.result_type IS 'Tipo de resultado de Meta Ads (e.g., "Mensajes iniciados")';
COMMENT ON COLUMN public.ads_costs_history.results IS 'Número de resultados/conversiones';
COMMENT ON COLUMN public.ads_costs_history.cost_per_result IS 'Coste por resultado';
COMMENT ON COLUMN public.ads_costs_history.reach IS 'Alcance total';
COMMENT ON COLUMN public.ads_costs_history.frequency IS 'Frecuencia media de visualización';
COMMENT ON COLUMN public.ads_costs_history.cpm IS 'CPM (coste por 1000 impresiones)';
COMMENT ON COLUMN public.ads_costs_history.link_clicks IS 'Clics en el enlace';