-- Endurecer y normalizar RLS + permitir operación de triggers

-- 1) Asegurar RLS habilitado
ALTER TABLE IF EXISTS public.company_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lead_scores ENABLE ROW LEVEL SECURITY;

-- 2) Limpiar políticas existentes para evitar solapamientos
DO $do$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='company_valuations' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.company_valuations', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='lead_behavior_events' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.lead_behavior_events', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='lead_scores' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.lead_scores', pol.policyname);
  END LOOP;
END
$do$;

-- 3) Políticas nuevas y claras
-- company_valuations
CREATE POLICY "Anyone can insert company valuations"
ON public.company_valuations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view company valuations"
ON public.company_valuations
FOR SELECT
USING (current_user_is_admin());

-- lead_behavior_events
CREATE POLICY "Anyone can insert behavior events"
ON public.lead_behavior_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view behavior events"
ON public.lead_behavior_events
FOR SELECT
USING (current_user_is_admin());

-- lead_scores (usado por triggers)
CREATE POLICY "Anyone can insert lead scores"
ON public.lead_scores
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update lead scores"
ON public.lead_scores
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view lead scores"
ON public.lead_scores
FOR SELECT
USING (current_user_is_admin());

-- 4) Asegurar que el trigger puede operar bajo RLS
CREATE OR REPLACE FUNCTION public.update_lead_score_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_score INTEGER;
  lead_record RECORD;
BEGIN
  new_score := public.calculate_lead_score(NEW.visitor_id);
  
  INSERT INTO public.lead_scores (
    visitor_id, 
    company_domain, 
    total_score, 
    last_activity,
    visit_count
  ) 
  VALUES (
    NEW.visitor_id, 
    NEW.company_domain, 
    new_score, 
    now(),
    1
  )
  ON CONFLICT (visitor_id) 
  DO UPDATE SET 
    total_score = new_score,
    last_activity = now(),
    visit_count = lead_scores.visit_count + 1,
    updated_at = now();
  
  SELECT * INTO lead_record 
  FROM public.lead_scores 
  WHERE visitor_id = NEW.visitor_id;
  
  IF lead_record.is_hot_lead AND NOT EXISTS (
    SELECT 1 FROM public.lead_alerts 
    WHERE lead_score_id = lead_record.id 
    AND alert_type = 'hot_lead'
    AND created_at > now() - INTERVAL '24 hours'
  ) THEN
    INSERT INTO public.lead_alerts (lead_score_id, alert_type, threshold_reached, message, priority)
    VALUES (
      lead_record.id,
      'hot_lead',
      lead_record.total_score,
      'Nuevo lead caliente detectado: ' || COALESCE(lead_record.company_name, lead_record.company_domain, 'Lead anónimo'),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
