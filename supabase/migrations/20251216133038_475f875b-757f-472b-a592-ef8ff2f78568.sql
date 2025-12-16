-- Add EBITDA column to general_contact_leads
ALTER TABLE public.general_contact_leads
ADD COLUMN IF NOT EXISTS ebitda text;

COMMENT ON COLUMN public.general_contact_leads.ebitda IS 'EBITDA anual de la empresa en euros';