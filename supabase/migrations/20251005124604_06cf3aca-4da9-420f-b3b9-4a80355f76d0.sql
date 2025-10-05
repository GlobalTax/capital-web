-- ============================================
-- LEAD MANAGEMENT SYSTEM - CRM Enhancement
-- ============================================

-- Create lead status enum
CREATE TYPE public.lead_status AS ENUM (
  'nuevo',
  'contactando',
  'calificado',
  'propuesta_enviada',
  'negociacion',
  'en_espera',
  'ganado',
  'perdido',
  'archivado'
);

-- Add assigned_to and status columns to company_valuations
ALTER TABLE public.company_valuations
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lead_status_crm lead_status DEFAULT 'nuevo',
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add assigned_to and status columns to contact_leads
ALTER TABLE public.contact_leads
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lead_status_crm lead_status DEFAULT 'nuevo',
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add assigned_to and status columns to collaborator_applications
ALTER TABLE public.collaborator_applications
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lead_status_crm lead_status DEFAULT 'nuevo',
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_valuations_assigned_to ON public.company_valuations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_valuations_lead_status ON public.company_valuations(lead_status_crm);
CREATE INDEX IF NOT EXISTS idx_contact_assigned_to ON public.contact_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_lead_status ON public.contact_leads(lead_status_crm);
CREATE INDEX IF NOT EXISTS idx_collab_assigned_to ON public.collaborator_applications(assigned_to);
CREATE INDEX IF NOT EXISTS idx_collab_lead_status ON public.collaborator_applications(lead_status_crm);

-- Function to update assigned_at timestamp
CREATE OR REPLACE FUNCTION public.update_lead_assignment_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If assigned_to changed, update assigned_at
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    NEW.assigned_at = NOW();
  END IF;
  
  -- If lead_status_crm changed, update status_updated_at
  IF NEW.lead_status_crm IS DISTINCT FROM OLD.lead_status_crm THEN
    NEW.status_updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for timestamp updates
DROP TRIGGER IF EXISTS trigger_update_valuation_assignment ON public.company_valuations;
CREATE TRIGGER trigger_update_valuation_assignment
  BEFORE UPDATE ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_assignment_timestamp();

DROP TRIGGER IF EXISTS trigger_update_contact_assignment ON public.contact_leads;
CREATE TRIGGER trigger_update_contact_assignment
  BEFORE UPDATE ON public.contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_assignment_timestamp();

DROP TRIGGER IF EXISTS trigger_update_collab_assignment ON public.collaborator_applications;
CREATE TRIGGER trigger_update_collab_assignment
  BEFORE UPDATE ON public.collaborator_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_assignment_timestamp();

-- Update RLS policies to include assigned leads filtering
-- This allows editors to see leads assigned to them

COMMENT ON COLUMN public.company_valuations.assigned_to IS 'Admin user responsible for this lead';
COMMENT ON COLUMN public.company_valuations.lead_status_crm IS 'Current status in the CRM workflow';
COMMENT ON COLUMN public.contact_leads.assigned_to IS 'Admin user responsible for this lead';
COMMENT ON COLUMN public.contact_leads.lead_status_crm IS 'Current status in the CRM workflow';
COMMENT ON COLUMN public.collaborator_applications.assigned_to IS 'Admin user responsible for this lead';
COMMENT ON COLUMN public.collaborator_applications.lead_status_crm IS 'Current status in the CRM workflow';