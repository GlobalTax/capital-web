-- Tabla para registrar gastos de campañas publicitarias
CREATE TABLE public.campaign_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('meta_ads', 'google_ads', 'linkedin_ads', 'other')),
  campaign_name TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  impressions INTEGER CHECK (impressions >= 0),
  clicks INTEGER CHECK (clicks >= 0),
  ctr DECIMAL(5,2) CHECK (ctr >= 0 AND ctr <= 100),
  cpc DECIMAL(8,2) CHECK (cpc >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices para consultas frecuentes
CREATE INDEX idx_campaign_costs_channel ON public.campaign_costs(channel);
CREATE INDEX idx_campaign_costs_period ON public.campaign_costs(period_start, period_end);
CREATE INDEX idx_campaign_costs_created_at ON public.campaign_costs(created_at DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_campaign_costs_updated_at
  BEFORE UPDATE ON public.campaign_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.campaign_costs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo admins pueden ver y modificar
CREATE POLICY "Admins can view campaign costs"
  ON public.campaign_costs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can insert campaign costs"
  ON public.campaign_costs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can update campaign costs"
  ON public.campaign_costs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can delete campaign costs"
  ON public.campaign_costs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );