-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Core performance indexes for company_operations table
CREATE INDEX IF NOT EXISTS idx_ops_active ON public.company_operations(is_active);
CREATE INDEX IF NOT EXISTS idx_ops_sector ON public.company_operations(sector);
CREATE INDEX IF NOT EXISTS idx_ops_year ON public.company_operations(year DESC);
CREATE INDEX IF NOT EXISTS idx_ops_featured ON public.company_operations(is_featured DESC);

-- GIN indexes for array and text search optimization
CREATE INDEX IF NOT EXISTS idx_ops_display_gin ON public.company_operations USING GIN (display_locations);
CREATE INDEX IF NOT EXISTS idx_ops_name_trgm ON public.company_operations USING GIN (company_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ops_desc_trgm ON public.company_operations USING GIN (description gin_trgm_ops);