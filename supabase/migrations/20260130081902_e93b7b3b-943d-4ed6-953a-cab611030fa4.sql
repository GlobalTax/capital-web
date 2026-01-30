-- =====================================================
-- Fix Inline Edit: Add missing columns to all lead tables
-- =====================================================

-- 1. Add updated_at to company_valuations (critical for inline updates)
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create trigger for auto-update
CREATE OR REPLACE FUNCTION public.update_company_valuations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_company_valuations_updated_at ON public.company_valuations;
CREATE TRIGGER trigger_update_company_valuations_updated_at
  BEFORE UPDATE ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_valuations_updated_at();

-- 2. Add lead_received_at to acquisition_leads
ALTER TABLE public.acquisition_leads 
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ DEFAULT now();

-- Backfill with created_at
UPDATE public.acquisition_leads 
SET lead_received_at = created_at 
WHERE lead_received_at IS NULL;

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_acquisition_leads_lead_received_at 
ON public.acquisition_leads(lead_received_at DESC);

-- 3. Add lead_status_crm to tables that don't have it
-- Using TEXT type for flexibility (not enum)

ALTER TABLE public.acquisition_leads 
ADD COLUMN IF NOT EXISTS lead_status_crm TEXT DEFAULT 'nuevo';

ALTER TABLE public.advisor_valuations 
ADD COLUMN IF NOT EXISTS lead_status_crm TEXT DEFAULT 'nuevo';

ALTER TABLE public.general_contact_leads 
ADD COLUMN IF NOT EXISTS lead_status_crm TEXT DEFAULT 'nuevo';

ALTER TABLE public.company_acquisition_inquiries 
ADD COLUMN IF NOT EXISTS lead_status_crm TEXT DEFAULT 'nuevo';

-- 4. Create indexes for status queries
CREATE INDEX IF NOT EXISTS idx_acquisition_leads_status_crm 
ON public.acquisition_leads(lead_status_crm);

CREATE INDEX IF NOT EXISTS idx_advisor_valuations_status_crm 
ON public.advisor_valuations(lead_status_crm);

CREATE INDEX IF NOT EXISTS idx_general_leads_status_crm 
ON public.general_contact_leads(lead_status_crm);

CREATE INDEX IF NOT EXISTS idx_company_acq_status_crm 
ON public.company_acquisition_inquiries(lead_status_crm);