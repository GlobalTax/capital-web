-- SECURITY FIX: Critical Data Exposure Remediation
-- Addressing all critical security findings

-- 1. CRITICAL: Secure company_valuations table - remove public read access
-- Drop any existing permissive policies that allow public access
DROP POLICY IF EXISTS "Anyone can view company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Public can read valuations" ON public.company_valuations;

-- Ensure only admins and authenticated users can read their own data
-- Keep existing secure policies but ensure no public read access exists

-- 2. CRITICAL: Secure tool_ratings table - admin only read access  
DROP POLICY IF EXISTS "Anyone can view tool ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Public can read tool ratings" ON public.tool_ratings;

-- Add admin-only read access for tool_ratings
CREATE POLICY "Admins can view tool ratings"
ON public.tool_ratings
FOR SELECT
USING (current_user_is_admin());

-- 3. CRITICAL: Secure newsletter_subscribers table - admin only read access
DROP POLICY IF EXISTS "Anyone can view newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public can read newsletter subscribers" ON public.newsletter_subscribers;

-- Add admin-only read access for newsletter_subscribers  
CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- 4. Add enhanced rate limiting and validation for public forms
-- Update existing rate limited policies with stronger validation

-- Enhanced tool rating policy with stricter validation
DROP POLICY IF EXISTS "Rate limited tool rating creation" ON public.tool_ratings;
CREATE POLICY "Secure tool rating creation with rate limiting"
ON public.tool_ratings  
FOR INSERT
WITH CHECK (
  -- Rate limiting: max 3 ratings per hour per IP
  public.check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'tool_rating',
    3,
    60
  ) AND
  -- Validation checks
  tool_name IS NOT NULL AND
  length(TRIM(tool_name)) >= 2 AND
  length(TRIM(tool_name)) <= 100 AND
  rating >= 1 AND rating <= 5 AND
  (email IS NULL OR (
    length(TRIM(email)) >= 5 AND 
    length(email) <= 254 AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ))
);

-- Enhanced newsletter subscription policy
DROP POLICY IF EXISTS "Rate limited newsletter subscription" ON public.newsletter_subscribers;
CREATE POLICY "Secure newsletter subscription with rate limiting"
ON public.newsletter_subscribers
FOR INSERT 
WITH CHECK (
  -- Rate limiting: max 2 subscriptions per hour per IP  
  public.check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'newsletter_subscription',
    2,
    60
  ) AND
  -- Enhanced email validation
  email IS NOT NULL AND
  length(TRIM(email)) >= 5 AND
  length(email) <= 254 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Optional name validation
  (full_name IS NULL OR (
    length(TRIM(full_name)) >= 2 AND
    length(TRIM(full_name)) <= 100
  ))
);

-- 5. Add comprehensive security logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_critical_security_event(
  event_type text,
  table_name text,
  operation text,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  -- Log high-priority security events
  PERFORM public.log_security_event(
    event_type,
    'high',
    table_name,
    operation,
    jsonb_build_object(
      'user_id', auth.uid(),
      'user_role', auth.role(), 
      'ip_address', inet_client_addr(),
      'timestamp', now(),
      'details', details
    )
  );
  
  -- Additional console logging for critical events
  RAISE LOG 'CRITICAL_SECURITY_EVENT: % on table % - Operation: % - User: % - IP: %', 
    event_type, table_name, operation, auth.uid(), inet_client_addr();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add triggers to monitor access to sensitive customer data
CREATE OR REPLACE FUNCTION public.monitor_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive customer data tables
  IF TG_OP = 'SELECT' AND auth.role() = 'anon' THEN
    PERFORM public.log_critical_security_event(
      'ANONYMOUS_SENSITIVE_DATA_ACCESS',
      TG_TABLE_NAME,
      'SELECT',
      jsonb_build_object('attempted_by_anonymous_user', true)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply monitoring to critical tables (note: SELECT triggers require special handling)
-- We'll monitor mutations instead for now
CREATE OR REPLACE FUNCTION public.monitor_data_mutations()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_critical_security_event(
    'SENSITIVE_DATA_MUTATION',
    TG_TABLE_NAME,
    TG_OP,
    jsonb_build_object(
      'record_id', COALESCE(NEW.id, OLD.id),
      'mutation_type', TG_OP
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add mutation monitoring to critical tables
CREATE TRIGGER monitor_valuations_mutations
  AFTER INSERT OR UPDATE OR DELETE ON public.company_valuations
  FOR EACH ROW EXECUTE FUNCTION public.monitor_data_mutations();

CREATE TRIGGER monitor_tool_ratings_mutations  
  AFTER INSERT OR UPDATE OR DELETE ON public.tool_ratings
  FOR EACH ROW EXECUTE FUNCTION public.monitor_data_mutations();

CREATE TRIGGER monitor_newsletter_mutations
  AFTER INSERT OR UPDATE OR DELETE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.monitor_data_mutations();