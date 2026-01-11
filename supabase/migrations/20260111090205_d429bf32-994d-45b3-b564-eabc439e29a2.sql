-- Add Apollo enrichment fields to all contact tables

-- contact_leads
ALTER TABLE public.contact_leads
ADD COLUMN IF NOT EXISTS apollo_status text DEFAULT 'none' CHECK (apollo_status IN ('none', 'running', 'ok', 'needs_review', 'error')),
ADD COLUMN IF NOT EXISTS apollo_error text,
ADD COLUMN IF NOT EXISTS apollo_org_id text,
ADD COLUMN IF NOT EXISTS apollo_last_enriched_at timestamptz,
ADD COLUMN IF NOT EXISTS email_domain text,
ADD COLUMN IF NOT EXISTS apollo_org_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_people_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_candidates jsonb;

-- collaborator_applications
ALTER TABLE public.collaborator_applications
ADD COLUMN IF NOT EXISTS apollo_status text DEFAULT 'none' CHECK (apollo_status IN ('none', 'running', 'ok', 'needs_review', 'error')),
ADD COLUMN IF NOT EXISTS apollo_error text,
ADD COLUMN IF NOT EXISTS apollo_org_id text,
ADD COLUMN IF NOT EXISTS apollo_last_enriched_at timestamptz,
ADD COLUMN IF NOT EXISTS email_domain text,
ADD COLUMN IF NOT EXISTS apollo_org_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_people_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_candidates jsonb;

-- acquisition_leads
ALTER TABLE public.acquisition_leads
ADD COLUMN IF NOT EXISTS apollo_status text DEFAULT 'none' CHECK (apollo_status IN ('none', 'running', 'ok', 'needs_review', 'error')),
ADD COLUMN IF NOT EXISTS apollo_error text,
ADD COLUMN IF NOT EXISTS apollo_org_id text,
ADD COLUMN IF NOT EXISTS apollo_last_enriched_at timestamptz,
ADD COLUMN IF NOT EXISTS email_domain text,
ADD COLUMN IF NOT EXISTS apollo_org_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_people_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_candidates jsonb;

-- company_acquisition_inquiries
ALTER TABLE public.company_acquisition_inquiries
ADD COLUMN IF NOT EXISTS apollo_status text DEFAULT 'none' CHECK (apollo_status IN ('none', 'running', 'ok', 'needs_review', 'error')),
ADD COLUMN IF NOT EXISTS apollo_error text,
ADD COLUMN IF NOT EXISTS apollo_org_id text,
ADD COLUMN IF NOT EXISTS apollo_last_enriched_at timestamptz,
ADD COLUMN IF NOT EXISTS email_domain text,
ADD COLUMN IF NOT EXISTS apollo_org_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_people_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_candidates jsonb;

-- general_contact_leads
ALTER TABLE public.general_contact_leads
ADD COLUMN IF NOT EXISTS apollo_status text DEFAULT 'none' CHECK (apollo_status IN ('none', 'running', 'ok', 'needs_review', 'error')),
ADD COLUMN IF NOT EXISTS apollo_error text,
ADD COLUMN IF NOT EXISTS apollo_org_id text,
ADD COLUMN IF NOT EXISTS apollo_last_enriched_at timestamptz,
ADD COLUMN IF NOT EXISTS email_domain text,
ADD COLUMN IF NOT EXISTS apollo_org_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_people_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_candidates jsonb;

-- advisor_valuations
ALTER TABLE public.advisor_valuations
ADD COLUMN IF NOT EXISTS apollo_status text DEFAULT 'none' CHECK (apollo_status IN ('none', 'running', 'ok', 'needs_review', 'error')),
ADD COLUMN IF NOT EXISTS apollo_error text,
ADD COLUMN IF NOT EXISTS apollo_org_id text,
ADD COLUMN IF NOT EXISTS apollo_last_enriched_at timestamptz,
ADD COLUMN IF NOT EXISTS email_domain text,
ADD COLUMN IF NOT EXISTS apollo_org_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_people_data jsonb,
ADD COLUMN IF NOT EXISTS apollo_candidates jsonb;

-- Add index for Apollo status filtering
CREATE INDEX IF NOT EXISTS idx_contact_leads_apollo_status ON public.contact_leads(apollo_status);
CREATE INDEX IF NOT EXISTS idx_collaborator_applications_apollo_status ON public.collaborator_applications(apollo_status);
CREATE INDEX IF NOT EXISTS idx_acquisition_leads_apollo_status ON public.acquisition_leads(apollo_status);
CREATE INDEX IF NOT EXISTS idx_company_acquisition_inquiries_apollo_status ON public.company_acquisition_inquiries(apollo_status);
CREATE INDEX IF NOT EXISTS idx_general_contact_leads_apollo_status ON public.general_contact_leads(apollo_status);
CREATE INDEX IF NOT EXISTS idx_advisor_valuations_apollo_status ON public.advisor_valuations(apollo_status);