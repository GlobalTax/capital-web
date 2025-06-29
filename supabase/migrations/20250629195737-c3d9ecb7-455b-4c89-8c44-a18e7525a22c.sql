
-- Tabla para secuencias de email
CREATE TABLE public.email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('download', 'form_fill', 'high_score', 'calculator_use', 'page_visit')),
  trigger_conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para emails individuales de las secuencias
CREATE TABLE public.email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  email_template TEXT DEFAULT 'default',
  include_attachment BOOLEAN DEFAULT false,
  attachment_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para envíos de email programados
CREATE TABLE public.scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_score_id UUID REFERENCES public.lead_scores(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.email_sequence_steps(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para A/B testing de formularios
CREATE TABLE public.form_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  variant_a_config JSONB NOT NULL,
  variant_b_config JSONB NOT NULL,
  traffic_split NUMERIC DEFAULT 0.5 CHECK (traffic_split >= 0 AND traffic_split <= 1),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  winner_variant TEXT CHECK (winner_variant IN ('A', 'B')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para tracking de conversiones por variante
CREATE TABLE public.form_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.form_ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  form_data JSONB DEFAULT '{}',
  converted BOOLEAN DEFAULT false,
  conversion_value NUMERIC DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para automation workflows
CREATE TABLE public.automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para ejecuciones de workflows
CREATE TABLE public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  lead_score_id UUID REFERENCES public.lead_scores(id) ON DELETE CASCADE,
  trigger_data JSONB DEFAULT '{}',
  execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'completed', 'failed')),
  actions_completed INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para métricas de marketing attribution
CREATE TABLE public.marketing_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_score_id UUID REFERENCES public.lead_scores(id) ON DELETE CASCADE,
  touchpoint_data JSONB NOT NULL,
  channel TEXT NOT NULL,
  campaign TEXT,
  medium TEXT,
  source TEXT,
  attribution_weight NUMERIC DEFAULT 1.0,
  conversion_value NUMERIC DEFAULT 0,
  touchpoint_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_email_sequences_trigger ON public.email_sequences(trigger_type);
CREATE INDEX idx_scheduled_emails_scheduled_for ON public.scheduled_emails(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_scheduled_emails_lead_score ON public.scheduled_emails(lead_score_id);
CREATE INDEX idx_form_conversions_test_variant ON public.form_conversions(test_id, variant);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(execution_status);
CREATE INDEX idx_marketing_attribution_lead ON public.marketing_attribution(lead_score_id);

-- Insertar secuencias de email por defecto
INSERT INTO public.email_sequences (name, trigger_type, trigger_conditions) VALUES
('Secuencia Valoración', 'calculator_use', '{"calculator_type": "valuation"}'),
('Nurturing Lead Magnets', 'download', '{"download_type": "lead_magnet"}'),
('Contacto Alto Score', 'high_score', '{"min_score": 80}'),
('Seguimiento Formulario', 'form_fill', '{"form_type": "contact"}');

-- Insertar pasos de email para secuencia de valoración
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content) VALUES
(
  (SELECT id FROM public.email_sequences WHERE name = 'Secuencia Valoración'),
  1, 0,
  '📊 Tu valoración empresarial está lista',
  'Gracias por usar nuestra calculadora de valoración. Hemos preparado un análisis detallado de tu empresa basado en los datos proporcionados.'
),
(
  (SELECT id FROM public.email_sequences WHERE name = 'Secuencia Valoración'),
  2, 48,
  '💡 3 errores comunes en valoración de empresas',
  'En Capittal hemos valorado cientos de empresas. Estos son los errores más frecuentes que vemos y cómo evitarlos.'
),
(
  (SELECT id FROM public.email_sequences WHERE name = 'Secuencia Valoración'),
  3, 168,
  '🎯 ¿Listo para una valoración profesional?',
  'Si estás considerando una operación M&A, nuestro equipo puede ayudarte con una valoración profesional completa.'
);

-- Crear workflows automáticos por defecto
INSERT INTO public.automation_workflows (name, description, trigger_conditions, actions) VALUES
(
  'Lead Caliente → Notificación Comercial',
  'Envía notificación al equipo comercial cuando un lead supera 80 puntos',
  '{"conditions": [{"field": "total_score", "operator": ">=", "value": 80}]}',
  '{"actions": [{"type": "send_notification", "target": "sales_team"}, {"type": "assign_lead", "assignee": "director_comercial"}]}'
),
(
  'Calculadora → Secuencia Email',
  'Inicia secuencia de nurturing cuando alguien usa la calculadora',
  '{"conditions": [{"field": "event_type", "operator": "=", "value": "calculator_use"}]}',
  '{"actions": [{"type": "start_email_sequence", "sequence": "valuation-nurture"}]}'
),
(
  'Múltiples Visitas → Lead Scoring Boost',
  'Aumenta score para visitantes recurrentes',
  '{"conditions": [{"field": "visit_count", "operator": ">=", "value": 3}]}',
  '{"actions": [{"type": "add_score", "points": 15}, {"type": "add_tag", "tag": "high_engagement"}]}'
);

-- Función para procesar workflows automáticamente
CREATE OR REPLACE FUNCTION public.process_automation_workflows()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workflow_record RECORD;
  lead_record RECORD;
  execution_id UUID;
  processed_count INTEGER := 0;
BEGIN
  -- Procesar cada workflow activo
  FOR workflow_record IN 
    SELECT * FROM public.automation_workflows 
    WHERE is_active = true
  LOOP
    -- Buscar leads que cumplan las condiciones
    FOR lead_record IN 
      SELECT ls.* FROM public.lead_scores ls
      WHERE NOT EXISTS (
        SELECT 1 FROM public.workflow_executions we
        WHERE we.workflow_id = workflow_record.id 
        AND we.lead_score_id = ls.id
        AND we.execution_status = 'completed'
        AND we.started_at > now() - INTERVAL '24 hours'
      )
    LOOP
      -- Crear ejecución del workflow
      INSERT INTO public.workflow_executions (
        workflow_id, 
        lead_score_id, 
        trigger_data, 
        total_actions
      ) VALUES (
        workflow_record.id,
        lead_record.id,
        row_to_json(lead_record),
        jsonb_array_length(workflow_record.actions->'actions')
      ) RETURNING id INTO execution_id;
      
      processed_count := processed_count + 1;
    END LOOP;
    
    -- Actualizar contador de ejecuciones
    UPDATE public.automation_workflows 
    SET execution_count = execution_count + 1,
        last_executed = now()
    WHERE id = workflow_record.id;
  END LOOP;
  
  RETURN processed_count;
END;
$$;

-- Trigger para iniciar workflows automáticamente
CREATE OR REPLACE FUNCTION public.trigger_automation_workflows()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Procesar workflows después de cambios en lead scores
  PERFORM public.process_automation_workflows();
  RETURN NEW;
END;
$$;

CREATE TRIGGER automation_trigger
  AFTER INSERT OR UPDATE ON public.lead_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_automation_workflows();
