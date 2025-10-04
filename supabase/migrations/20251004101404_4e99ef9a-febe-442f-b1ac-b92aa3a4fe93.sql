-- Add subsector column to company_operations table
ALTER TABLE public.company_operations 
ADD COLUMN subsector TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.company_operations.subsector IS 'Subsector o especialización específica dentro del sector principal (opcional)';