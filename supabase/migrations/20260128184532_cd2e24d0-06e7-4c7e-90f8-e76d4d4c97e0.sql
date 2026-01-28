-- Tabla para histórico de costes de ads importados desde Excel
-- Los datos se guardan TAL CUAL vienen del Excel sin modificaciones

CREATE TYPE public.ads_platform AS ENUM ('meta_ads', 'google_ads');

CREATE TABLE public.ads_costs_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform ads_platform NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_id TEXT,
  date DATE NOT NULL,
  spend NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  impressions BIGINT,
  clicks BIGINT,
  conversions INTEGER,
  raw_row JSONB NOT NULL,
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  imported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_ads_costs_platform ON public.ads_costs_history(platform);
CREATE INDEX idx_ads_costs_date ON public.ads_costs_history(date DESC);
CREATE INDEX idx_ads_costs_campaign ON public.ads_costs_history(campaign_name);
CREATE INDEX idx_ads_costs_platform_date ON public.ads_costs_history(platform, date DESC);

-- Índice compuesto para detectar duplicados
CREATE INDEX idx_ads_costs_duplicate_check ON public.ads_costs_history(platform, campaign_name, date, spend);

-- RLS
ALTER TABLE public.ads_costs_history ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver e insertar datos
CREATE POLICY "Admins can view ads costs history"
  ON public.ads_costs_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can insert ads costs history"
  ON public.ads_costs_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Comentarios
COMMENT ON TABLE public.ads_costs_history IS 'Histórico de costes de ads importados desde Excel - datos sin modificar';
COMMENT ON COLUMN public.ads_costs_history.platform IS 'Plataforma de origen: meta_ads o google_ads';
COMMENT ON COLUMN public.ads_costs_history.campaign_name IS 'Nombre de campaña exactamente como viene en el Excel';
COMMENT ON COLUMN public.ads_costs_history.raw_row IS 'Fila original del Excel en JSON para trazabilidad';
COMMENT ON COLUMN public.ads_costs_history.imported_at IS 'Timestamp de cuándo se importó este registro';
COMMENT ON COLUMN public.ads_costs_history.imported_by IS 'Usuario admin que realizó la importación';