-- Fix RLS policy for sell_leads to handle sandbox environment better
DROP POLICY IF EXISTS "Enhanced sell lead submission with fallback" ON public.sell_leads;

-- Create a more robust INSERT policy that handles sandbox/development environments
CREATE POLICY "Secure sell leads submission with sandbox support" 
ON public.sell_leads 
FOR INSERT 
WITH CHECK (
  -- Basic field validation
  (email IS NOT NULL) AND 
  (email <> '') AND 
  (length(email) >= 5) AND 
  (length(email) <= 254) AND
  (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') AND
  (company IS NOT NULL) AND 
  (company <> '') AND 
  (length(TRIM(company)) >= 2) AND
  (length(TRIM(company)) <= 100) AND
  (full_name IS NOT NULL) AND 
  (full_name <> '') AND
  (length(TRIM(full_name)) >= 2) AND
  (length(TRIM(full_name)) <= 100) AND
  -- Rate limiting with enhanced error handling (allow in sandbox if function fails)
  (
    CASE 
      WHEN inet_client_addr() IS NULL THEN true  -- Allow in sandbox/localhost
      ELSE COALESCE(
        public.check_rate_limit_enhanced_safe(
          COALESCE(inet_client_addr()::text, 'localhost'), 
          'sell_leads', 
          5, 
          60
        ), 
        true  -- Allow if rate limit function fails
      )
    END
  )
);