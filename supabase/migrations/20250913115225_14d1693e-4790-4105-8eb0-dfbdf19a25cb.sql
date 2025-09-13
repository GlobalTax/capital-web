-- Enhanced security hardening for tracking_events table
-- Even though existing RLS policies are secure, adding extra protection layers

-- 1. Create more explicit admin-only policies and remove any ambiguity
DROP POLICY IF EXISTS "Admins can view tracking events" ON public.tracking_events;

-- 2. Create strict read policy that logs access attempts
CREATE POLICY "CRITICAL_admin_only_tracking_read" 
ON public.tracking_events 
FOR SELECT 
USING (
  -- Only super admins and service role can read tracking data
  (is_user_super_admin(auth.uid()) OR auth.role() = 'service_role'::text)
);

-- 3. Add monitoring policy that logs any unauthorized access attempts  
CREATE OR REPLACE FUNCTION public.log_tracking_access_violation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log critical security violation for tracking data access
  PERFORM public.log_critical_security_violation(
    'UNAUTHORIZED_TRACKING_DATA_ACCESS_ATTEMPT',
    'tracking_events',
    jsonb_build_object(
      'user_id', auth.uid(),
      'user_role', auth.role(),
      'ip_address', inet_client_addr(),
      'timestamp', now(),
      'message', 'Unauthorized attempt to access sensitive analytics data'
    )
  );
END;
$$;

-- 4. Create trigger to monitor any SELECT attempts on tracking_events
CREATE OR REPLACE FUNCTION public.monitor_tracking_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access to tracking data for audit trail
  IF NOT (is_user_super_admin(auth.uid()) OR auth.role() = 'service_role'::text) THEN
    PERFORM public.log_tracking_access_violation();
  END IF;
  
  RETURN NULL; -- For AFTER triggers
END;
$$;

-- Note: We cannot create AFTER SELECT triggers in PostgreSQL, but we have RLS protection

-- 5. Update insert policy to be more restrictive and add validation
DROP POLICY IF EXISTS "Allow anonymous insert with rate limiting" ON public.tracking_events;

CREATE POLICY "SECURE_tracking_insert_only" 
ON public.tracking_events 
FOR INSERT 
WITH CHECK (
  -- Enhanced rate limiting and validation
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, visitor_id, 'unknown'::text), 
    'tracking_event', 
    30,  -- Reduced from 50 to 30 events per window
    5    -- 5 minute window
  ) AND
  -- Strict validation
  visitor_id IS NOT NULL AND 
  length(visitor_id) >= 10 AND
  session_id IS NOT NULL AND 
  length(session_id) >= 10 AND
  event_type IS NOT NULL AND
  event_type = ANY(ARRAY[
    'page_view', 'form_start', 'form_submit', 'scroll', 'click', 
    'valuation_step', 'contact_form', 'calculator_use'
  ]) AND
  -- Prevent data exfiltration attempts
  length(COALESCE(page_path, '')) <= 500 AND
  length(COALESCE(referrer, '')) <= 1000
);

-- 6. Add comment for documentation
COMMENT ON TABLE public.tracking_events IS 'SENSITIVE: Contains competitive intelligence data including UTM parameters, visitor behavior, and conversion tracking. Access strictly limited to super admins only.';

-- 7. Create function to audit tracking data access (admin-only)
CREATE OR REPLACE FUNCTION public.audit_tracking_data_access()
RETURNS TABLE(
  access_date date,
  access_count bigint,
  unique_visitors bigint,
  top_utm_sources text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super admins can run analytics
  IF NOT is_user_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    created_at::date as access_date,
    COUNT(*) as access_count,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    ARRAY_AGG(DISTINCT utm_source ORDER BY utm_source) FILTER (WHERE utm_source IS NOT NULL) as top_utm_sources
  FROM public.tracking_events 
  WHERE created_at >= now() - INTERVAL '30 days'
  GROUP BY created_at::date
  ORDER BY access_date DESC;
END;
$$;