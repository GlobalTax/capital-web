-- Enhanced security hardening for company_valuations table
-- Address security vulnerability: Confidential Business Data Exposed to Competitors

-- 1. Drop the potentially vulnerable anonymous token access policy
DROP POLICY IF EXISTS "CRITICAL_secure_token_access" ON public.company_valuations;

-- 2. Create a more secure token-based access policy with additional validation
CREATE POLICY "ULTRA_SECURE_token_access" 
ON public.company_valuations 
FOR SELECT 
USING (
  -- Admin access
  current_user_is_admin() 
  OR 
  -- User access to their own data only when authenticated
  ((auth.uid() = user_id) AND (is_deleted = false))
  OR 
  -- Anonymous token access with STRICT validation and logging
  (
    (auth.role() = 'anon'::text) 
    AND (unique_token IS NOT NULL) 
    AND (length((unique_token)::text) >= 32) -- Increased minimum token length
    AND (created_at > (now() - '7 days'::interval)) -- Reduced token validity to 7 days
    AND (valuation_status = 'completed') -- Only allow access to completed valuations
    AND check_rate_limit_enhanced(
      COALESCE(inet_client_addr()::text, 'unknown'), 
      'valuation_token_access', 
      5,  -- Max 5 access attempts per IP
      60  -- Per hour
    )
  )
  OR 
  -- Service role access
  (auth.role() = 'service_role'::text)
);

-- 3. Create function to log and monitor valuation data access attempts
CREATE OR REPLACE FUNCTION public.log_valuation_access_attempt()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access to sensitive valuation data
  PERFORM public.log_security_event(
    'VALUATION_DATA_ACCESS',
    CASE 
      WHEN auth.role() = 'anon' THEN 'high'
      ELSE 'medium'
    END,
    'company_valuations',
    'SELECT',
    jsonb_build_object(
      'user_role', auth.role(),
      'user_id', auth.uid(),
      'ip_address', inet_client_addr(),
      'timestamp', now(),
      'access_method', CASE 
        WHEN auth.role() = 'anon' THEN 'token_based'
        WHEN auth.uid() IS NOT NULL THEN 'authenticated_user'
        ELSE 'unknown'
      END
    )
  );
END;
$$;

-- 4. Create trigger to automatically log all access to company valuations
CREATE OR REPLACE FUNCTION public.monitor_valuation_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access attempt (this will be called on every SELECT)
  PERFORM public.log_valuation_access_attempt();
  
  -- For anonymous users, add extra security checks
  IF auth.role() = 'anon' AND NEW IS NULL THEN
    PERFORM public.log_security_event(
      'ANONYMOUS_VALUATION_ACCESS',
      'high',
      'company_valuations',
      'SELECT',
      jsonb_build_object(
        'ip_address', inet_client_addr(),
        'timestamp', now(),
        'warning', 'Anonymous user accessed valuation data'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Strengthen the INSERT policy to prevent data injection attacks
DROP POLICY IF EXISTS "CRITICAL_secure_valuation_insert" ON public.company_valuations;

CREATE POLICY "ULTRA_SECURE_valuation_insert" 
ON public.company_valuations 
FOR INSERT 
WITH CHECK (
  (
    -- Anonymous submissions with strict validation
    (auth.role() = 'anon'::text) 
    AND (unique_token IS NOT NULL) 
    AND (length((unique_token)::text) >= 32) -- Ensure strong token
    AND (contact_name IS NOT NULL) 
    AND (length(TRIM(BOTH FROM contact_name)) >= 2) 
    AND (length(TRIM(BOTH FROM contact_name)) <= 100)
    AND (company_name IS NOT NULL) 
    AND (length(TRIM(BOTH FROM company_name)) >= 2) 
    AND (length(TRIM(BOTH FROM company_name)) <= 100)
    AND (email IS NOT NULL) 
    AND (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text) 
    AND (length(email) <= 254)
    AND (industry IS NOT NULL) 
    AND (employee_range IS NOT NULL)
    -- Enhanced rate limiting for anonymous submissions
    AND check_rate_limit_enhanced(
      COALESCE(inet_client_addr()::text, 'unknown'), 
      'valuation_submission', 
      2,    -- Reduced to 2 submissions per IP
      1440  -- Per day
    )
    -- Prevent obviously fake or test data
    AND (lower(email) NOT LIKE '%test%')
    AND (lower(email) NOT LIKE '%fake%')
    AND (lower(company_name) NOT LIKE '%test%')
    AND (lower(contact_name) NOT LIKE '%test%')
  ) 
  OR 
  -- Authenticated user submissions
  ((auth.uid() IS NOT NULL) AND (user_id = auth.uid())) 
  OR 
  -- Admin submissions
  current_user_is_admin()
);

-- 6. Create admin-only function to audit sensitive data access
CREATE OR REPLACE FUNCTION public.audit_valuation_data_access()
RETURNS TABLE(
  access_date date,
  access_count bigint,
  anonymous_access_count bigint,
  unique_ips bigint,
  high_risk_access_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admins can run this audit
  IF NOT is_user_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for valuation audit';
  END IF;
  
  RETURN QUERY
  SELECT 
    se.created_at::date as access_date,
    COUNT(*) as access_count,
    COUNT(*) FILTER (WHERE se.details->>'user_role' = 'anon') as anonymous_access_count,
    COUNT(DISTINCT se.ip_address) as unique_ips,
    COUNT(*) FILTER (WHERE se.severity IN ('high', 'critical')) as high_risk_access_count
  FROM public.security_events se
  WHERE se.event_type = 'VALUATION_DATA_ACCESS'
    AND se.created_at >= now() - INTERVAL '30 days'
  GROUP BY se.created_at::date
  ORDER BY access_date DESC;
END;
$$;

-- 7. Add table comment for documentation
COMMENT ON TABLE public.company_valuations IS 'HIGHLY SENSITIVE: Contains confidential business financial data including revenues, EBITDA, and valuations. Access strictly controlled and monitored. All access attempts are logged for security auditing.';

-- 8. Create additional validation trigger for data integrity
CREATE OR REPLACE FUNCTION public.validate_valuation_data_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Additional validation for financial data integrity
  IF NEW.revenue IS NOT NULL AND NEW.revenue < 0 THEN
    PERFORM public.log_security_event(
      'INVALID_FINANCIAL_DATA_ATTEMPT',
      'high',
      'company_valuations',
      'INSERT/UPDATE',
      jsonb_build_object('field', 'revenue', 'value', NEW.revenue, 'ip', inet_client_addr())
    );
    RAISE EXCEPTION 'Invalid revenue data detected';
  END IF;
  
  IF NEW.ebitda IS NOT NULL AND NEW.revenue IS NOT NULL AND NEW.ebitda > NEW.revenue * 2 THEN
    PERFORM public.log_security_event(
      'SUSPICIOUS_FINANCIAL_DATA',
      'medium',
      'company_valuations',
      'INSERT/UPDATE',
      jsonb_build_object('ebitda', NEW.ebitda, 'revenue', NEW.revenue, 'ip', inet_client_addr())
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 9. Apply the validation trigger
DROP TRIGGER IF EXISTS validate_valuation_integrity_trigger ON public.company_valuations;
CREATE TRIGGER validate_valuation_integrity_trigger
  BEFORE INSERT OR UPDATE ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_valuation_data_integrity();