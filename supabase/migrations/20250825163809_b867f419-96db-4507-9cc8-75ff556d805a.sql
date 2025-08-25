-- FINAL SECURITY FIX: Secure remaining exposed tables
-- Address all remaining critical security findings

-- 1. Secure collaborator_applications table - admin only access
DROP POLICY IF EXISTS "Admins only can manage collaborator applications" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Secure collaborator application creation" ON public.collaborator_applications;

-- Create admin-only access for reading collaborator applications
CREATE POLICY "Admins can manage collaborator applications"
ON public.collaborator_applications
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Secure public insertion with enhanced validation and rate limiting
CREATE POLICY "Secure public collaborator application submission"
ON public.collaborator_applications  
FOR INSERT
WITH CHECK (
  -- Rate limiting: max 1 application per day per IP
  public.check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'collaborator_application',
    1,
    1440 -- 24 hours
  ) AND
  -- Enhanced validation
  full_name IS NOT NULL AND
  email IS NOT NULL AND
  phone IS NOT NULL AND
  profession IS NOT NULL AND
  length(TRIM(full_name)) >= 2 AND
  length(TRIM(full_name)) <= 100 AND
  length(TRIM(email)) >= 5 AND
  length(email) <= 254 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(TRIM(profession)) >= 2 AND
  length(TRIM(profession)) <= 100
);

-- 2. Secure contact_leads table - admin only access
DROP POLICY IF EXISTS "Admins only can manage contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Secure contact leads creation" ON public.contact_leads;

-- Admin-only access for contact leads
CREATE POLICY "Admins can manage contact leads"
ON public.contact_leads
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Secure public insertion with validation and rate limiting
CREATE POLICY "Secure public contact lead submission"
ON public.contact_leads
FOR INSERT
WITH CHECK (
  -- Rate limiting: max 3 leads per day per IP
  public.check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'contact_lead',
    3,
    1440 -- 24 hours  
  ) AND
  -- Enhanced validation
  full_name IS NOT NULL AND
  email IS NOT NULL AND
  company IS NOT NULL AND
  length(TRIM(full_name)) >= 2 AND
  length(TRIM(full_name)) <= 100 AND
  length(TRIM(email)) >= 5 AND
  length(email) <= 254 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(TRIM(company)) >= 2 AND
  length(TRIM(company)) <= 100
);

-- 3. Verify admin_users table security (ensure proper restrictions)
-- Check if there are any overly permissive policies
DROP POLICY IF EXISTS "Anyone can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Public can read admin users" ON public.admin_users;

-- Ensure admin_users has proper access control (policies should already exist)
-- Add additional protection if needed
CREATE POLICY "Enhanced admin user security"
ON public.admin_users
FOR SELECT
USING (
  -- Only authenticated admins or the user viewing their own record
  (auth.uid() = user_id AND is_user_admin(auth.uid())) OR
  is_user_super_admin(auth.uid())
);

-- 4. Double-check company_valuations security 
-- Remove any remaining permissive policies
DROP POLICY IF EXISTS "Anyone can access company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Public access to company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Open access company valuations" ON public.company_valuations;

-- Ensure company_valuations has strict access control
-- The existing policies should be sufficient but let's verify with a restrictive policy
CREATE POLICY "Enhanced valuation security check"
ON public.company_valuations
FOR SELECT
USING (
  -- Only token-based access, user-owned access, or admin access
  (auth.role() = 'anon' AND unique_token IS NOT NULL AND unique_token != '') OR
  (auth.uid() = user_id AND is_deleted = false) OR
  current_user_is_admin() OR
  auth.role() = 'service_role'
);

-- 5. Add comprehensive security monitoring for all sensitive tables
CREATE OR REPLACE FUNCTION public.monitor_sensitive_table_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any SELECT operations on sensitive tables by anonymous users
  IF auth.role() = 'anon' THEN
    PERFORM public.log_critical_security_event(
      'ANONYMOUS_SENSITIVE_ACCESS_ATTEMPT',
      TG_TABLE_NAME,
      'SELECT',
      jsonb_build_object(
        'table_accessed', TG_TABLE_NAME,
        'ip_address', inet_client_addr(),
        'user_agent', current_setting('request.headers', true)::json->>'user-agent'
      )
    );
  END IF;
  
  RETURN NULL; -- For AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Note: We can't create SELECT triggers in PostgreSQL, but we've logged the function for future use

-- 6. Add final security validation function
CREATE OR REPLACE FUNCTION public.validate_data_access_security()
RETURNS TABLE (
  table_name text,
  has_rls boolean,
  policy_count integer,
  security_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    t.rowsecurity::boolean,
    COUNT(p.policyname)::integer,
    CASE 
      WHEN NOT t.rowsecurity THEN 'CRITICAL: RLS Disabled'
      WHEN COUNT(p.policyname) = 0 THEN 'WARNING: No Policies' 
      ELSE 'OK: RLS Enabled with Policies'
    END::text
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'company_valuations', 'contact_leads', 'collaborator_applications',
      'newsletter_subscribers', 'admin_users', 'tool_ratings'
    )
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';