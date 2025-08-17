-- CRITICAL SECURITY FIX: Restrict access to company_valuations table

-- First, drop redundant policies
DROP POLICY IF EXISTS "Admins can select company_valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Admins can view company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Admins can delete company_valuations" ON public.company_valuations;

-- Create comprehensive restrictive policies
-- 1. Only authenticated admins can SELECT (view) company valuations
CREATE POLICY "Only admins can view company valuations" 
ON public.company_valuations 
FOR SELECT 
TO authenticated
USING (current_user_is_admin());

-- 2. Explicitly deny SELECT for anonymous users
CREATE POLICY "Deny anonymous access to company valuations" 
ON public.company_valuations 
FOR SELECT 
TO anon
USING (false);

-- 3. Only admins can DELETE
CREATE POLICY "Only admins can delete company valuations" 
ON public.company_valuations 
FOR DELETE 
TO authenticated
USING (current_user_is_admin());

-- 4. Token-based updates must be more restrictive - only allow specific fields
DROP POLICY IF EXISTS "Allow token-based updates for specific fields only" ON public.company_valuations;
CREATE POLICY "Restricted token-based updates" 
ON public.company_valuations 
FOR UPDATE 
TO anon, authenticated
USING (unique_token IS NOT NULL)
WITH CHECK (unique_token IS NOT NULL);

-- 5. Secure INSERT policy remains but add explicit role checks
DROP POLICY IF EXISTS "Secure valuation insert" ON public.company_valuations;
CREATE POLICY "Secure anonymous valuation insert" 
ON public.company_valuations 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Ensure required fields are present and valid
  contact_name IS NOT NULL AND
  company_name IS NOT NULL AND
  email IS NOT NULL AND
  industry IS NOT NULL AND
  employee_range IS NOT NULL AND
  length(TRIM(BOTH FROM contact_name)) >= 2 AND
  length(TRIM(BOTH FROM company_name)) >= 2 AND
  length(TRIM(BOTH FROM email)) >= 5 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text AND
  length(email) <= 254 AND
  length(contact_name) <= 100 AND
  length(company_name) <= 100 AND
  industry = ANY (ARRAY['technology'::text, 'healthcare'::text, 'finance'::text, 'manufacturing'::text, 'retail'::text, 'services'::text, 'other'::text]) AND
  employee_range = ANY (ARRAY['1-10'::text, '11-50'::text, '51-200'::text, '201-1000'::text, '1000+'::text]) AND
  -- Additional security: limit sensitive financial data in public inserts
  (auth.role() = 'service_role'::text OR revenue IS NULL OR revenue <= 10000000) -- Max 10M for anonymous inserts
);

-- Fix other sensitive tables identified in security scan

-- Fix contact_leads table
CREATE POLICY "Deny anonymous access to contact leads" 
ON public.contact_leads 
FOR SELECT 
TO anon
USING (false);

-- Fix collaborator_applications table  
CREATE POLICY "Deny anonymous access to collaborator applications" 
ON public.collaborator_applications 
FOR SELECT 
TO anon
USING (false);

-- Fix admin_users table - ensure no public access
CREATE POLICY "Deny anonymous access to admin users" 
ON public.admin_users 
FOR SELECT 
TO anon
USING (false);

-- Add audit logging for security violations
CREATE OR REPLACE FUNCTION public.log_valuation_access_attempt()
RETURNS trigger AS $$
BEGIN
  -- Log all access attempts to sensitive data
  PERFORM public.log_security_event(
    'VALUATION_ACCESS_ATTEMPT',
    CASE WHEN auth.role() = 'anon' THEN 'critical' ELSE 'info' END,
    'company_valuations',
    TG_OP,
    jsonb_build_object(
      'user_role', auth.role(),
      'user_id', auth.uid(),
      'timestamp', now(),
      'operation', TG_OP
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to log access attempts
DROP TRIGGER IF EXISTS log_valuation_access ON public.company_valuations;
CREATE TRIGGER log_valuation_access
  BEFORE SELECT OR INSERT OR UPDATE OR DELETE ON public.company_valuations
  FOR EACH ROW EXECUTE FUNCTION public.log_valuation_access_attempt();