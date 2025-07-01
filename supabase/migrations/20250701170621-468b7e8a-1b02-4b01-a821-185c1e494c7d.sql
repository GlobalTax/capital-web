
-- Habilitar RLS en todas las tablas afectadas y crear políticas de seguridad

-- 1. Tabla lead_scoring_rules (solo admins pueden gestionar)
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lead scoring rules" 
  ON public.lead_scoring_rules 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 2. Tabla lead_behavior_events (solo admins pueden ver, inserción pública para tracking)
ALTER TABLE public.lead_behavior_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track behavior events" 
  ON public.lead_behavior_events 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view behavior events" 
  ON public.lead_behavior_events 
  FOR SELECT 
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can manage behavior events" 
  ON public.lead_behavior_events 
  FOR UPDATE 
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can delete behavior events" 
  ON public.lead_behavior_events 
  FOR DELETE 
  USING (public.current_user_is_admin());

-- 3. Tabla lead_scores (solo admins pueden gestionar)
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lead scores" 
  ON public.lead_scores 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 4. Tabla lead_alerts (solo admins pueden gestionar)
ALTER TABLE public.lead_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lead alerts" 
  ON public.lead_alerts 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 5. Tabla email_sequences (solo admins pueden gestionar)
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email sequences" 
  ON public.email_sequences 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 6. Tabla email_sequence_steps (solo admins pueden gestionar)
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email sequence steps" 
  ON public.email_sequence_steps 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 7. Tabla scheduled_emails (solo admins pueden gestionar)
ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled emails" 
  ON public.scheduled_emails 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 8. Tabla form_ab_tests (solo admins pueden gestionar)
ALTER TABLE public.form_ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage form AB tests" 
  ON public.form_ab_tests 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 9. Tabla form_conversions (inserción pública, visualización solo admin)
ALTER TABLE public.form_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track form conversions" 
  ON public.form_conversions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view form conversions" 
  ON public.form_conversions 
  FOR SELECT 
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can manage form conversions" 
  ON public.form_conversions 
  FOR UPDATE 
  USING (public.current_user_is_admin());

CREATE POLICY "Admins can delete form conversions" 
  ON public.form_conversions 
  FOR DELETE 
  USING (public.current_user_is_admin());

-- 10. Tabla automation_workflows (solo admins pueden gestionar)
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation workflows" 
  ON public.automation_workflows 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 11. Tabla workflow_executions (solo admins pueden gestionar)
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage workflow executions" 
  ON public.workflow_executions 
  FOR ALL 
  USING (public.current_user_is_admin());

-- 12. Tabla marketing_attribution (solo admins pueden gestionar)
ALTER TABLE public.marketing_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage marketing attribution" 
  ON public.marketing_attribution 
  FOR ALL 
  USING (public.current_user_is_admin());

-- Crear índices adicionales para mejorar el rendimiento de las consultas RLS
CREATE INDEX IF NOT EXISTS idx_lead_behavior_events_created_at ON public.lead_behavior_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_scores_is_hot_lead_active ON public.lead_scores(is_hot_lead, lead_status) WHERE is_hot_lead = true AND lead_status = 'active';
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status_workflow ON public.workflow_executions(execution_status, workflow_id);

-- Comentarios para documentar las decisiones de seguridad
COMMENT ON TABLE public.lead_scoring_rules IS 'RLS: Solo administradores pueden gestionar reglas de scoring - datos críticos del negocio';
COMMENT ON TABLE public.lead_behavior_events IS 'RLS: Inserción pública para tracking, visualización solo admins - datos de comportamiento sensibles';
COMMENT ON TABLE public.lead_scores IS 'RLS: Solo administradores - datos de leads altamente sensibles para el negocio';
COMMENT ON TABLE public.lead_alerts IS 'RLS: Solo administradores - alertas internas del sistema';
COMMENT ON TABLE public.email_sequences IS 'RLS: Solo administradores - configuración de campañas de marketing';
COMMENT ON TABLE public.email_sequence_steps IS 'RLS: Solo administradores - contenido de emails y estrategias de nurturing';
COMMENT ON TABLE public.scheduled_emails IS 'RLS: Solo administradores - datos de envíos y métricas de email';
COMMENT ON TABLE public.form_ab_tests IS 'RLS: Solo administradores - experimentos y optimización de conversión';
COMMENT ON TABLE public.form_conversions IS 'RLS: Inserción pública para tracking, gestión solo admins - datos de conversión';
COMMENT ON TABLE public.automation_workflows IS 'RLS: Solo administradores - lógica de automatización crítica';
COMMENT ON TABLE public.workflow_executions IS 'RLS: Solo administradores - historial de ejecuciones de workflows';
COMMENT ON TABLE public.marketing_attribution IS 'RLS: Solo administradores - datos de atribución de marketing estratégicos';
