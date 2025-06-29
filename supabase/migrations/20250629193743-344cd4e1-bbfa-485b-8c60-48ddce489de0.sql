
-- Tabla para reglas de scoring configurables
CREATE TABLE public.lead_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('page_view', 'download', 'form_fill', 'time_on_site', 'calculator_use', 'contact_intent', 'return_visit')),
  page_pattern TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  decay_days INTEGER DEFAULT NULL, -- Días después de los cuales los puntos se reducen
  industry_specific TEXT[], -- Sectores específicos para esta regla
  company_size_filter TEXT[], -- Tamaños de empresa específicos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para eventos de comportamiento detallados
CREATE TABLE public.lead_behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  visitor_id TEXT, -- IP o identificador único del visitante
  company_domain TEXT,
  event_type TEXT NOT NULL,
  page_path TEXT,
  event_data JSONB DEFAULT '{}',
  points_awarded INTEGER DEFAULT 0,
  rule_id UUID REFERENCES public.lead_scoring_rules(id),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para puntuaciones de leads (agregadas)
CREATE TABLE public.lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  company_domain TEXT,
  company_name TEXT,
  industry TEXT,
  company_size TEXT,
  location TEXT,
  total_score INTEGER DEFAULT 0,
  hot_lead_threshold INTEGER DEFAULT 80,
  is_hot_lead BOOLEAN GENERATED ALWAYS AS (total_score >= hot_lead_threshold) STORED,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_visit TIMESTAMP WITH TIME ZONE DEFAULT now(),
  visit_count INTEGER DEFAULT 1,
  email TEXT,
  phone TEXT,
  contact_name TEXT,
  lead_status TEXT DEFAULT 'active' CHECK (lead_status IN ('active', 'contacted', 'converted', 'cold')),
  assigned_to UUID, -- Para asignar leads a sales reps
  notes TEXT,
  crm_synced BOOLEAN DEFAULT false,
  crm_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(visitor_id)
);

-- Tabla para alertas de leads calientes
CREATE TABLE public.lead_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_score_id UUID REFERENCES public.lead_scores(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('hot_lead', 'score_threshold', 'high_intent', 'return_visitor')),
  threshold_reached INTEGER,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insertar reglas de scoring por defecto
INSERT INTO public.lead_scoring_rules (name, trigger_type, page_pattern, points, description) VALUES
('Visita página servicios', 'page_view', '%/servicios%', 5, 'Interés general en servicios'),
('Visita valoraciones', 'page_view', '%/valoraciones%', 15, 'Interés en valoraciones'),
('Uso calculadora', 'calculator_use', '/calculadora-valoracion%', 30, 'Uso activo de calculadora'),
('Descarga material', 'download', NULL, 25, 'Descarga de lead magnet'),
('Formulario contacto', 'form_fill', '%/contacto%', 50, 'Completó formulario de contacto'),
('Intención contacto', 'contact_intent', '%/contact%', 20, 'Visitó página de contacto'),
('Visitante recurrente', 'return_visit', NULL, 10, 'Visitante que regresa'),
('Tiempo en sitio', 'time_on_site', NULL, 1, 'Por cada minuto en el sitio');

-- Índices para performance
CREATE INDEX idx_lead_behavior_events_visitor_id ON public.lead_behavior_events(visitor_id);
CREATE INDEX idx_lead_behavior_events_company_domain ON public.lead_behavior_events(company_domain);
CREATE INDEX idx_lead_behavior_events_created_at ON public.lead_behavior_events(created_at);
CREATE INDEX idx_lead_scores_total_score ON public.lead_scores(total_score DESC);
CREATE INDEX idx_lead_scores_is_hot_lead ON public.lead_scores(is_hot_lead) WHERE is_hot_lead = true;
CREATE INDEX idx_lead_scores_last_activity ON public.lead_scores(last_activity DESC);

-- Función para calcular score automáticamente
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_visitor_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_points INTEGER := 0;
  behavior_record RECORD;
  rule_record RECORD;
  days_since_event INTEGER;
  adjusted_points INTEGER;
BEGIN
  -- Sumar puntos de todos los eventos del visitante
  FOR behavior_record IN 
    SELECT lbe.*, lsr.points, lsr.decay_days
    FROM public.lead_behavior_events lbe
    LEFT JOIN public.lead_scoring_rules lsr ON lbe.rule_id = lsr.id
    WHERE lbe.visitor_id = p_visitor_id
    AND lsr.is_active = true
  LOOP
    adjusted_points := behavior_record.points;
    
    -- Aplicar decay si está configurado
    IF behavior_record.decay_days IS NOT NULL THEN
      days_since_event := EXTRACT(days FROM now() - behavior_record.created_at);
      
      IF days_since_event > behavior_record.decay_days THEN
        -- Reducir puntos gradualmente
        adjusted_points := GREATEST(0, behavior_record.points * (1.0 - (days_since_event::FLOAT / (behavior_record.decay_days * 2))));
      END IF;
    END IF;
    
    total_points := total_points + adjusted_points;
  END LOOP;
  
  -- Limitar score máximo a 100
  RETURN LEAST(total_points, 100);
END;
$$;

-- Trigger para actualizar scores automáticamente
CREATE OR REPLACE FUNCTION public.update_lead_score_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_score INTEGER;
  lead_record RECORD;
BEGIN
  -- Calcular nuevo score
  new_score := public.calculate_lead_score(NEW.visitor_id);
  
  -- Actualizar o insertar en lead_scores
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
  
  -- Crear alerta si supera threshold de hot lead
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
$$;

-- Crear trigger
CREATE TRIGGER lead_behavior_score_update
  AFTER INSERT ON public.lead_behavior_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_score_trigger();

-- Función para limpiar datos antiguos (opcional)
CREATE OR REPLACE FUNCTION public.cleanup_old_lead_data()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Eliminar eventos de más de 6 meses
  DELETE FROM public.lead_behavior_events 
  WHERE created_at < now() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Eliminar leads inactivos de más de 1 año
  DELETE FROM public.lead_scores 
  WHERE last_activity < now() - INTERVAL '1 year'
  AND lead_status = 'cold';
  
  RETURN deleted_count;
END;
$$;
