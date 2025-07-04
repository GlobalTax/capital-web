-- Arreglar políticas RLS faltantes para Lead Scoring

-- 1. Políticas para lead_behavior_events
CREATE POLICY "Anyone can view behavior events" 
  ON public.lead_behavior_events 
  FOR SELECT 
  USING (true);

-- 2. Políticas para lead_scores
CREATE POLICY "Anyone can insert lead scores" 
  ON public.lead_scores 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view lead scores" 
  ON public.lead_scores 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update lead scores" 
  ON public.lead_scores 
  FOR UPDATE 
  USING (true);

-- 3. Políticas para lead_alerts
CREATE POLICY "Anyone can insert lead alerts" 
  ON public.lead_alerts 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view lead alerts" 
  ON public.lead_alerts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can update lead alerts" 
  ON public.lead_alerts 
  FOR UPDATE 
  USING (current_user_is_admin());

-- 4. Verificar que RLS esté habilitado correctamente
ALTER TABLE public.lead_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_alerts ENABLE ROW LEVEL SECURITY;