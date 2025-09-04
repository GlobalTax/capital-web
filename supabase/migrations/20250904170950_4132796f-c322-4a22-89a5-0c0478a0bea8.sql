-- Allow anonymous users to insert into sell_leads like company_valuations does
DROP POLICY IF EXISTS "Simple sell leads insert" ON public.sell_leads;

CREATE POLICY "Allow anonymous sell leads insert" 
ON public.sell_leads 
FOR INSERT 
WITH CHECK (
  (full_name IS NOT NULL) AND 
  (TRIM(BOTH FROM full_name) <> ''::text) AND 
  (length(TRIM(BOTH FROM full_name)) >= 2) AND 
  (length(TRIM(BOTH FROM full_name)) <= 100) AND 
  (company IS NOT NULL) AND 
  (TRIM(BOTH FROM company) <> ''::text) AND 
  (length(TRIM(BOTH FROM company)) >= 2) AND 
  (length(TRIM(BOTH FROM company)) <= 100) AND 
  (email IS NOT NULL) AND 
  (TRIM(BOTH FROM email) <> ''::text) AND 
  (length(email) >= 5) AND 
  (length(email) <= 254) AND 
  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text) AND
  check_rate_limit_enhanced_safe(COALESCE(inet_client_addr()::text, 'unknown'), 'sell_lead_submission', 3, 1440)
);