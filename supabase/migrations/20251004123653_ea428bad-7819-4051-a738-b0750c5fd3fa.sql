-- Drop calculator_results table first (has FK to sector_calculators)
DROP TABLE IF EXISTS public.calculator_results CASCADE;

-- Drop sector_calculators table
DROP TABLE IF EXISTS public.sector_calculators CASCADE;