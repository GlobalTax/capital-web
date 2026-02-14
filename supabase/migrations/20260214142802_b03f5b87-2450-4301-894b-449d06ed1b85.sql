
-- Allow anonymous inserts for initial seed (we'll restrict later if needed, admin policy already covers this)
CREATE POLICY "Allow anonymous insert for seed" ON public.pe_sector_intelligence FOR INSERT WITH CHECK (true);
