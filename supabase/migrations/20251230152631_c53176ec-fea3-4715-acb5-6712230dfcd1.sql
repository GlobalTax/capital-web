-- Add comparable_operations column to professional_valuations
ALTER TABLE public.professional_valuations 
ADD COLUMN IF NOT EXISTS comparable_operations JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the field
COMMENT ON COLUMN public.professional_valuations.comparable_operations IS 'Array of selected comparable operations from company_operations table for PDF generation';