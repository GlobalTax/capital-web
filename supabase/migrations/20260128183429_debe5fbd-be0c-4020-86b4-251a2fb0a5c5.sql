-- Add lead_received_at column to contact_leads for business-level registration date tracking
-- This allows retroactive correction without touching created_at audit timestamp

-- 1. Add column to contact_leads
ALTER TABLE public.contact_leads
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMP WITH TIME ZONE;

-- Set default for existing records in contact_leads (safe)
UPDATE public.contact_leads 
SET lead_received_at = created_at 
WHERE lead_received_at IS NULL;

-- Add default for new records
ALTER TABLE public.contact_leads
ALTER COLUMN lead_received_at SET DEFAULT now();

-- Add index for filtering/sorting by lead_received_at
CREATE INDEX IF NOT EXISTS idx_contact_leads_lead_received_at 
ON public.contact_leads(lead_received_at DESC);

-- Comment explaining purpose
COMMENT ON COLUMN public.contact_leads.lead_received_at IS 'Business registration date for analytics. Can be edited retroactively. Defaults to created_at.';