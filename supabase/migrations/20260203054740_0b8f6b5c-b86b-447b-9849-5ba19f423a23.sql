-- Tabla para almacenar deals del Wanted Market de Dealsuite
CREATE TABLE IF NOT EXISTS public.dealsuite_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  sector TEXT,
  country TEXT,
  ebitda_min NUMERIC,
  ebitda_max NUMERIC,
  revenue_min NUMERIC,
  revenue_max NUMERIC,
  deal_type TEXT,
  advisor TEXT,
  description TEXT,
  published_at TIMESTAMPTZ,
  detail_url TEXT,
  raw_data JSONB,
  source_url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_dealsuite_deals_sector ON public.dealsuite_deals(sector);
CREATE INDEX IF NOT EXISTS idx_dealsuite_deals_country ON public.dealsuite_deals(country);
CREATE INDEX IF NOT EXISTS idx_dealsuite_deals_scraped_at ON public.dealsuite_deals(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_dealsuite_deals_deal_type ON public.dealsuite_deals(deal_type);

-- Habilitar RLS
ALTER TABLE public.dealsuite_deals ENABLE ROW LEVEL SECURITY;

-- Política RLS: Solo admins pueden gestionar deals
CREATE POLICY "Admins can manage dealsuite_deals"
  ON public.dealsuite_deals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_dealsuite_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dealsuite_deals_updated_at
  BEFORE UPDATE ON public.dealsuite_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dealsuite_deals_updated_at();