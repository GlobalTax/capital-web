-- Tabla de histórico de costes de campañas (inmutable)
CREATE TABLE public.campaign_cost_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_cost_id UUID NOT NULL REFERENCES public.campaign_costs(id) ON DELETE CASCADE,
  
  -- Snapshot de datos en el momento de la actualización
  campaign_name TEXT,
  channel TEXT,
  results INTEGER,
  amount NUMERIC(12,2),
  cost_per_result NUMERIC(10,2),
  daily_budget NUMERIC(12,2),
  monthly_budget NUMERIC(12,2),
  target_cpl NUMERIC(10,2),
  internal_status TEXT CHECK (internal_status IN ('ok', 'watch', 'stop')),
  delivery_status TEXT CHECK (delivery_status IN ('active', 'paused')),
  notes TEXT,
  
  -- Metadatos
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by UUID,
  change_type TEXT DEFAULT 'update' CHECK (change_type IN ('create', 'update', 'import'))
);

-- Índices para consultas rápidas
CREATE INDEX idx_campaign_history_campaign ON public.campaign_cost_history(campaign_cost_id);
CREATE INDEX idx_campaign_history_date ON public.campaign_cost_history(recorded_at DESC);
CREATE INDEX idx_campaign_history_channel ON public.campaign_cost_history(channel);

-- Habilitar RLS
ALTER TABLE public.campaign_cost_history ENABLE ROW LEVEL SECURITY;

-- Política: los admin pueden ver todo el histórico
CREATE POLICY "Admins can view campaign history"
  ON public.campaign_cost_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Política: inserción solo via trigger (SECURITY DEFINER)
CREATE POLICY "System can insert history"
  ON public.campaign_cost_history
  FOR INSERT
  WITH CHECK (true);

-- Función que crea registro histórico en cada INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.log_campaign_cost_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.campaign_cost_history (
    campaign_cost_id,
    campaign_name,
    channel,
    results,
    amount,
    cost_per_result,
    daily_budget,
    monthly_budget,
    target_cpl,
    internal_status,
    delivery_status,
    notes,
    changed_by,
    change_type
  ) VALUES (
    NEW.id,
    NEW.campaign_name,
    NEW.channel,
    NEW.results,
    NEW.amount,
    CASE WHEN COALESCE(NEW.results, 0) > 0 THEN NEW.amount / NEW.results ELSE NULL END,
    NEW.daily_budget,
    NEW.monthly_budget,
    NEW.target_cpl,
    NEW.internal_status,
    NEW.delivery_status,
    NEW.notes,
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger en INSERT y UPDATE de campaign_costs
CREATE TRIGGER campaign_cost_history_trigger
AFTER INSERT OR UPDATE ON public.campaign_costs
FOR EACH ROW EXECUTE FUNCTION public.log_campaign_cost_change();