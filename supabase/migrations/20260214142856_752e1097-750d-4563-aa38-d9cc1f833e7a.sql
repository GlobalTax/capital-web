
-- Grant insert to anon for initial seed, plus allow content_calendar operations
GRANT INSERT ON public.pe_sector_intelligence TO anon;
GRANT ALL ON public.content_calendar TO anon, authenticated;
GRANT ALL ON public.pe_sector_intelligence TO authenticated;

-- Drop the overly permissive seed policy (admin policy already covers authenticated inserts)
DROP POLICY IF EXISTS "Allow anonymous insert for seed" ON public.pe_sector_intelligence;
