
-- Crear tabla para envíos de email programados
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

-- Crear índices para optimizar consultas
CREATE INDEX idx_scheduled_emails_scheduled_for ON public.scheduled_emails(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_scheduled_emails_lead_score ON public.scheduled_emails(lead_score_id);
CREATE INDEX idx_scheduled_emails_sequence ON public.scheduled_emails(sequence_id);

-- Crear tabla workflow_executions que está referenciada pero no existe
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

-- Crear índices para workflow_executions
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(execution_status);
CREATE INDEX idx_workflow_executions_lead_score ON public.workflow_executions(lead_score_id);
