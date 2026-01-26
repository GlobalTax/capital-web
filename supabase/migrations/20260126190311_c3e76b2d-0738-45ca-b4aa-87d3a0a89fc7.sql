-- Add lead_source and lead_source_detail columns to company_valuations
ALTER TABLE public.company_valuations
ADD COLUMN IF NOT EXISTS lead_source TEXT,
ADD COLUMN IF NOT EXISTS lead_source_detail TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.company_valuations.lead_source IS 'Canal de origen del lead (meta-ads, google-ads, llamada-entrante, referido, etc.)';
COMMENT ON COLUMN public.company_valuations.lead_source_detail IS 'Detalle adicional del origen (nombre de campaña, referido por, etc.)';