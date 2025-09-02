-- Create GIN and TRGM indices for operations search optimization
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indices for JSONB display_locations
CREATE INDEX IF NOT EXISTS idx_company_operations_display_locations_gin 
ON public.company_operations USING GIN (display_locations);

-- TRGM indices for text search
CREATE INDEX IF NOT EXISTS idx_company_operations_company_name_trgm 
ON public.company_operations USING GIN (company_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_company_operations_description_trgm 
ON public.company_operations USING GIN (description gin_trgm_ops);

-- Standard indices for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_company_operations_is_active 
ON public.company_operations (is_active);

CREATE INDEX IF NOT EXISTS idx_company_operations_sector 
ON public.company_operations (sector);

CREATE INDEX IF NOT EXISTS idx_company_operations_year 
ON public.company_operations (year);

CREATE INDEX IF NOT EXISTS idx_company_operations_is_featured 
ON public.company_operations (is_featured);

-- Composite indices for common query patterns
CREATE INDEX IF NOT EXISTS idx_company_operations_active_sector 
ON public.company_operations (is_active, sector);

CREATE INDEX IF NOT EXISTS idx_company_operations_active_year 
ON public.company_operations (is_active, year DESC);

CREATE INDEX IF NOT EXISTS idx_company_operations_featured_active 
ON public.company_operations (is_featured, is_active);