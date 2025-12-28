-- =============================================
-- TABLA: lead_activities - Historial de actividades por lead
-- =============================================

CREATE TABLE public.lead_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  lead_type TEXT NOT NULL DEFAULT 'valuation' CHECK (lead_type IN ('valuation', 'contact', 'collaborator', 'acquisition')),
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'email_confirmation_sent',
    'email_opened',
    'email_precall_sent',
    'email_followup_sent',
    'call_attempted',
    'call_completed',
    'call_no_answer',
    'note_added',
    'status_changed',
    'assigned',
    'meeting_scheduled',
    'proposal_sent',
    'document_uploaded',
    'created'
  )),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_lead_type ON public.lead_activities(lead_type);
CREATE INDEX idx_lead_activities_created_at ON public.lead_activities(created_at DESC);
CREATE INDEX idx_lead_activities_activity_type ON public.lead_activities(activity_type);

-- Enable RLS
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo admins pueden ver/crear actividades
CREATE POLICY "Admins can view all lead activities" 
ON public.lead_activities 
FOR SELECT 
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can create lead activities" 
ON public.lead_activities 
FOR INSERT 
WITH CHECK (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can update lead activities" 
ON public.lead_activities 
FOR UPDATE 
USING (public.is_user_admin(auth.uid()));

-- =============================================
-- FUNCIÓN: Registrar actividad automáticamente al cambiar estado
-- =============================================

CREATE OR REPLACE FUNCTION public.log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm THEN
    INSERT INTO public.lead_activities (
      lead_id,
      lead_type,
      activity_type,
      description,
      metadata,
      created_by
    ) VALUES (
      NEW.id,
      'valuation',
      'status_changed',
      'Estado cambiado de ' || COALESCE(OLD.lead_status_crm::text, 'nuevo') || ' a ' || COALESCE(NEW.lead_status_crm::text, 'nuevo'),
      jsonb_build_object(
        'old_status', OLD.lead_status_crm,
        'new_status', NEW.lead_status_crm
      ),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para company_valuations
CREATE TRIGGER trigger_log_valuation_status_change
  AFTER UPDATE ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_status_change();

-- =============================================
-- FUNCIÓN: Registrar cuando se asigna un lead
-- =============================================

CREATE OR REPLACE FUNCTION public.log_lead_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assigned_name TEXT;
BEGIN
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    -- Obtener nombre del asignado
    SELECT full_name INTO assigned_name
    FROM public.admin_users
    WHERE user_id = NEW.assigned_to;
    
    INSERT INTO public.lead_activities (
      lead_id,
      lead_type,
      activity_type,
      description,
      metadata,
      created_by
    ) VALUES (
      NEW.id,
      'valuation',
      'assigned',
      CASE 
        WHEN NEW.assigned_to IS NULL THEN 'Lead desasignado'
        ELSE 'Lead asignado a ' || COALESCE(assigned_name, 'usuario')
      END,
      jsonb_build_object(
        'old_assigned_to', OLD.assigned_to,
        'new_assigned_to', NEW.assigned_to,
        'assigned_name', assigned_name
      ),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para asignaciones
CREATE TRIGGER trigger_log_valuation_assignment
  AFTER UPDATE ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_assignment();

-- =============================================
-- Añadir columnas de seguimiento comercial si no existen
-- =============================================

ALTER TABLE public.company_valuations 
  ADD COLUMN IF NOT EXISTS precall_email_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS precall_email_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS followup_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_call_attempt_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS call_attempts_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;