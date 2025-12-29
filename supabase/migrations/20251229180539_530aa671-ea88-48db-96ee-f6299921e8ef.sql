-- Add lead_entry_date to contact_leads for consistency
ALTER TABLE public.contact_leads 
ADD COLUMN IF NOT EXISTS lead_entry_date TIMESTAMPTZ;

COMMENT ON COLUMN public.contact_leads.lead_entry_date IS 'Fecha de entrada manual del lead, puede diferir de created_at';