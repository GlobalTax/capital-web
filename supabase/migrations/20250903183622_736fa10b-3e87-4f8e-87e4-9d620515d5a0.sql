-- Replace the complex policy with a simple one for development
DROP POLICY IF EXISTS "Allow sell leads with robust validation" ON public.sell_leads;

-- Create a simple policy without rate limiting
CREATE POLICY "Simple sell leads insert" 
ON public.sell_leads 
FOR INSERT 
WITH CHECK (
  -- Basic field validation only
  full_name IS NOT NULL AND 
  TRIM(full_name) <> '' AND 
  length(TRIM(full_name)) >= 2 AND
  length(TRIM(full_name)) <= 100 AND
  
  company IS NOT NULL AND 
  TRIM(company) <> '' AND 
  length(TRIM(company)) >= 2 AND
  length(TRIM(company)) <= 100 AND
  
  email IS NOT NULL AND 
  TRIM(email) <> '' AND 
  length(email) >= 5 AND 
  length(email) <= 254 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);