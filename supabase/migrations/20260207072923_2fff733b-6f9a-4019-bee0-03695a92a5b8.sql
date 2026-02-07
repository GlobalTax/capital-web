
-- Add AI classification columns to empresas table (matching lead tables structure)
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_company_summary TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_company_summary_at TIMESTAMPTZ;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_sector_pe TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_sector_name TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_tags TEXT[];
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_business_model_tags TEXT[];
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_negative_tags TEXT[];
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_classification_confidence INTEGER;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ai_classification_at TIMESTAMPTZ;
