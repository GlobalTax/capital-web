
-- Crear tabla para tracking de eventos de formularios
CREATE TABLE public.form_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('start', 'field_change', 'validation_error', 'submit', 'complete', 'abandon')),
  field_name TEXT,
  field_value TEXT,
  error_message TEXT,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_form_tracking_events_form_type ON public.form_tracking_events(form_type);
CREATE INDEX idx_form_tracking_events_visitor_id ON public.form_tracking_events(visitor_id);
CREATE INDEX idx_form_tracking_events_session_id ON public.form_tracking_events(session_id);
CREATE INDEX idx_form_tracking_events_timestamp ON public.form_tracking_events(timestamp);
CREATE INDEX idx_form_tracking_events_event_type ON public.form_tracking_events(event_type);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_form_tracking_events_updated_at
  BEFORE UPDATE ON public.form_tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.form_tracking_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage form tracking events" 
  ON public.form_tracking_events 
  FOR ALL 
  USING (current_user_is_admin());

CREATE POLICY "Anyone can track form events" 
  ON public.form_tracking_events 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view form tracking events" 
  ON public.form_tracking_events 
  FOR SELECT 
  USING (current_user_is_admin());
