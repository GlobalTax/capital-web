-- Add Apollo enrichment fields to company_valuations table
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS apollo_status text DEFAULT 'none' CHECK (apollo_status IN ('none', 'running', 'ok', 'needs_review', 'error'));

ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS apollo_error text;

ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS apollo_org_id text;

ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS apollo_last_enriched_at timestamptz;

ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS email_domain text;

ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS apollo_org_data jsonb;

ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS apollo_people_data jsonb;

ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS apollo_candidates jsonb;

-- Create index for faster queries by status
CREATE INDEX IF NOT EXISTS idx_company_valuations_apollo_status ON public.company_valuations(apollo_status);

-- Add comment for documentation
COMMENT ON COLUMN public.company_valuations.apollo_status IS 'Apollo enrichment status: none, running, ok, needs_review, error';
COMMENT ON COLUMN public.company_valuations.apollo_org_data IS 'Enriched organization data from Apollo API';
COMMENT ON COLUMN public.company_valuations.apollo_people_data IS 'Decision makers from Apollo People Search';
COMMENT ON COLUMN public.company_valuations.apollo_candidates IS 'Candidate organizations when multiple matches found';