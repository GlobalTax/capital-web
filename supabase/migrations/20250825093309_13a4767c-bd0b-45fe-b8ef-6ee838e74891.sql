-- SECURITY FIX: Critical Data Exposure Remediation (Fixed)
-- Handle existing policies properly

-- 1. Clean up ALL existing policies on sensitive tables first
-- tool_ratings policies
DROP POLICY IF EXISTS "Admins can view tool ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Anyone can view tool ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Public can read tool ratings" ON public.tool_ratings;
DROP POLICY IF EXISTS "Rate limited tool rating creation" ON public.tool_ratings;
DROP POLICY IF EXISTS "Secure tool rating creation with rate limiting" ON public.tool_ratings;

-- newsletter_subscribers policies  
DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can view newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public can read newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Rate limited newsletter subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Secure newsletter subscription with rate limiting" ON public.newsletter_subscribers;

-- company_valuations policies (only remove dangerous public ones)
DROP POLICY IF EXISTS "Anyone can view company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Public can read valuations" ON public.company_valuations;

-- 2. Create secure policies for tool_ratings (ADMIN READ ONLY)
CREATE POLICY "Admins can view and manage tool ratings"
ON public.tool_ratings
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Secure public insertion for tool ratings with strict validation
CREATE POLICY "Public tool rating submission with security"
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
  -- Strict validation
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

-- 3. Create secure policies for newsletter_subscribers (ADMIN READ ONLY)
CREATE POLICY "Admins full access newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Secure public subscription with strict validation  
CREATE POLICY "Public newsletter subscription with security"
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
  -- Strict email validation
  email IS NOT NULL AND
  length(TRIM(email)) >= 5 AND
  length(email) <= 254 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Name validation if provided
  (full_name IS NULL OR (
    length(TRIM(full_name)) >= 2 AND
    length(TRIM(full_name)) <= 100
  ))
);

-- 4. Enhanced security logging functions
CREATE OR REPLACE FUNCTION public.log_critical_security_event(
  event_type text,
  table_name text,
  operation text,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
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
  
  RAISE LOG 'CRITICAL_SECURITY_EVENT: % on table % - Operation: % - User: % - IP: %', 
    event_type, table_name, operation, auth.uid(), inet_client_addr();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security monitoring function for mutations
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

-- Add monitoring triggers (remove existing first)
DROP TRIGGER IF EXISTS monitor_valuations_mutations ON public.company_valuations;
DROP TRIGGER IF EXISTS monitor_tool_ratings_mutations ON public.tool_ratings;
DROP TRIGGER IF EXISTS monitor_newsletter_mutations ON public.newsletter_subscribers;

CREATE TRIGGER monitor_valuations_mutations
  AFTER INSERT OR UPDATE OR DELETE ON public.company_valuations
  FOR EACH ROW EXECUTE FUNCTION public.monitor_data_mutations();

CREATE TRIGGER monitor_tool_ratings_mutations  
  AFTER INSERT OR UPDATE OR DELETE ON public.tool_ratings
  FOR EACH ROW EXECUTE FUNCTION public.monitor_data_mutations();

CREATE TRIGGER monitor_newsletter_mutations
  AFTER INSERT OR UPDATE OR DELETE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.monitor_data_mutations();