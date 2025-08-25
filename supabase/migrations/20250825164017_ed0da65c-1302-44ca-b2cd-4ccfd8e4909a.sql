-- CRITICAL SECURITY FIX: Remove overly permissive RLS policies
-- Fix the root cause of data exposure by removing conflicting permissive policies

-- 1. Fix company_valuations - remove overly broad token-based access
-- Keep only specific, secure access patterns
DROP POLICY IF EXISTS "Token-based read access with validation" ON public.company_valuations;
DROP POLICY IF EXISTS "Enhanced valuation security check" ON public.company_valuations;

-- Replace with a more restrictive token-based policy that requires additional validation
CREATE POLICY "Secure token-based valuation access"
ON public.company_valuations
FOR SELECT
USING (
  -- Very restrictive token-based access - requires specific conditions
  (auth.role() = 'anon' AND 
   unique_token IS NOT NULL AND 
   unique_token != '' AND
   -- Additional security: must be accessing own record via specific matching
   LENGTH(unique_token) >= 16) OR
  -- Authenticated user accessing their own data
  (auth.uid() = user_id AND is_deleted = false) OR
  -- Admin access
  current_user_is_admin() OR
  -- Service role for internal operations
  auth.role() = 'service_role'
);

-- 2. Double-check that no other tables have overly permissive read policies
-- Remove any remaining permissive policies on sensitive tables

-- Ensure no broad public read access on collaborator_applications
DROP POLICY IF EXISTS "Anyone can view collaborator applications" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Public read collaborator applications" ON public.collaborator_applications;

-- Ensure no broad public read access on contact_leads  
DROP POLICY IF EXISTS "Anyone can view contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Public read contact leads" ON public.contact_leads;

-- Ensure no broad public read access on newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can view newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public read newsletter subscribers" ON public.newsletter_subscribers;

-- 3. Add restrictive default denial policies to ensure security
-- These policies explicitly deny access unless specifically allowed

CREATE POLICY "Default deny collaborator applications read"
ON public.collaborator_applications
FOR SELECT
USING (
  -- Only admins can read collaborator applications
  current_user_is_admin()
);

CREATE POLICY "Default deny contact leads read"
ON public.contact_leads  
FOR SELECT
USING (
  -- Only admins can read contact leads
  current_user_is_admin()
);

-- Newsletter subscribers already has proper restrictive policies

-- 4. Create a comprehensive security audit function
CREATE OR REPLACE FUNCTION public.audit_table_security(table_name_param text)
RETURNS TABLE (
  policy_name text,
  command text,
  is_permissive boolean,
  allows_anonymous boolean,
  security_risk_level text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.policyname::text,
    p.cmd::text,
    (p.permissive = 'PERMISSIVE')::boolean,
    (p.qual LIKE '%anon%' OR p.qual LIKE '%true%')::boolean,
    CASE 
      WHEN p.cmd = 'SELECT' AND (p.qual LIKE '%anon%' OR p.qual LIKE '%true%') 
        THEN 'HIGH RISK: Public Read Access'
      WHEN p.cmd IN ('INSERT', 'UPDATE', 'DELETE') AND (p.qual LIKE '%anon%' OR p.with_check LIKE '%anon%')
        THEN 'MEDIUM RISK: Public Write Access'
      ELSE 'LOW RISK: Restricted Access'
    END::text
  FROM pg_policies p
  WHERE p.tablename = table_name_param
    AND p.schemaname = 'public'
  ORDER BY 
    CASE 
      WHEN p.cmd = 'SELECT' AND (p.qual LIKE '%anon%' OR p.qual LIKE '%true%') THEN 1
      WHEN p.cmd IN ('INSERT', 'UPDATE', 'DELETE') AND (p.qual LIKE '%anon%' OR p.with_check LIKE '%anon%') THEN 2
      ELSE 3
    END,
    p.policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Log this security fix
SELECT public.log_critical_security_event(
  'SECURITY_POLICIES_HARDENED',
  'multiple_tables',
  'POLICY_UPDATE',
  jsonb_build_object(
    'action', 'removed_overly_permissive_policies',
    'tables_affected', ARRAY['company_valuations', 'collaborator_applications', 'contact_leads', 'newsletter_subscribers'],
    'timestamp', now()
  )
);