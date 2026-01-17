-- Add columns to track Apollo visitor data source and enrichment
ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS apollo_visitor_date timestamptz,
ADD COLUMN IF NOT EXISTS apollo_visitor_source text,
ADD COLUMN IF NOT EXISTS apollo_enriched_at timestamptz;

-- Add comment for documentation
COMMENT ON COLUMN public.empresas.apollo_visitor_date IS 'Date of the original website visitor event from Apollo';
COMMENT ON COLUMN public.empresas.apollo_visitor_source IS 'Source of the Apollo data: website_visitor, manual_import, list_import, enriched';
COMMENT ON COLUMN public.empresas.apollo_enriched_at IS 'Last time this company was enriched via Apollo organizations/enrich API';