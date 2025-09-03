-- Fix RLS policy for sell_leads to use the safe rate limiting function
DROP POLICY IF EXISTS "Enhanced sell lead submission with fallback" ON public.sell_leads;

-- Create updated policy with the safe function
CREATE POLICY "Enhanced sell lead submission with fallback" 
ON public.sell_leads 
FOR INSERT 
WITH CHECK (
  -- Allow if basic data validation passes
  (
    email IS NOT NULL 
    AND email != '' 
    AND length(email) >= 5
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND company_name IS NOT NULL 
    AND company_name != ''
    AND contact_name IS NOT NULL 
    AND contact_name != ''
  )
  AND
  -- Use the safe rate limiting function that handles sandbox environments
  (
    public.check_rate_limit_enhanced_safe(
      COALESCE(
        (inet_client_addr())::text,
        'sandbox-fallback'
      ),
      'sell_leads',
      5,
      60
    ) = true
  )
);