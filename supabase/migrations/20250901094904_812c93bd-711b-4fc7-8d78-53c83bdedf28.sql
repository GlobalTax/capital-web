-- Fix security vulnerability in lead_behavior_events table
-- Remove public access to sensitive visitor tracking data

-- Drop the problematic policies that allow public access to visitor data
DROP POLICY IF EXISTS "Admins can view behavior events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "Admins only can manage lead behavior events" ON public.lead_behavior_events;

-- Create secure policies that restrict access to admins and service role only
CREATE POLICY "SECURE_admin_only_view_behavior_events" 
ON public.lead_behavior_events 
FOR SELECT 
TO authenticated
USING (current_user_is_admin());

CREATE POLICY "SECURE_service_role_view_behavior_events" 
ON public.lead_behavior_events 
FOR SELECT 
TO service_role
USING (true);

-- Keep admin management policies but restrict to authenticated users only
CREATE POLICY "SECURE_admin_update_behavior_events" 
ON public.lead_behavior_events 
FOR UPDATE 
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "SECURE_admin_delete_behavior_events" 
ON public.lead_behavior_events 
FOR DELETE 
TO authenticated
USING (current_user_is_admin());

-- Enhanced INSERT policy with rate limiting and data validation
-- Allows anonymous tracking but with strict validation and rate limiting
CREATE POLICY "SECURE_tracking_insert_only" 
ON public.lead_behavior_events 
FOR INSERT 
TO anon, authenticated, service_role
WITH CHECK (
  -- Validate required fields exist and have proper format
  (event_type IS NOT NULL) AND 
  (session_id IS NOT NULL) AND 
  (visitor_id IS NOT NULL) AND
  -- Validate field lengths for security
  (length(TRIM(BOTH FROM event_type)) >= 2 AND length(TRIM(BOTH FROM event_type)) <= 50) AND
  (length(TRIM(BOTH FROM session_id)) >= 10 AND length(TRIM(BOTH FROM session_id)) <= 100) AND
  (length(TRIM(BOTH FROM visitor_id)) >= 10 AND length(TRIM(BOTH FROM visitor_id)) <= 100) AND
  -- Whitelist allowed event types
  (event_type = ANY (ARRAY[
    'page_view'::text, 
    'form_interaction'::text, 
    'calculator_usage'::text, 
    'download'::text, 
    'scroll'::text, 
    'time_on_page'::text,
    'valuation_completed'::text,
    'contact_interest'::text
  ])) AND
  -- Rate limiting to prevent abuse
  check_rate_limit_enhanced(
    COALESCE(visitor_id, session_id, inet_client_addr()::text, 'unknown'), 
    'behavior_event', 
    10, -- max 10 events
    5   -- per 5 minutes
  )
);

-- Add security monitoring trigger for unauthorized access attempts
CREATE OR REPLACE FUNCTION public.log_behavior_events_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any SELECT attempts by non-admin users (should be blocked by RLS)
  IF TG_OP = 'SELECT' AND NOT current_user_is_admin() THEN
    PERFORM public.log_security_event(
      'UNAUTHORIZED_BEHAVIOR_DATA_ACCESS',
      'critical',
      'lead_behavior_events',
      'SELECT',
      jsonb_build_object(
        'user_id', auth.uid(),
        'user_role', auth.role(),
        'ip_address', inet_client_addr(),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NULL; -- For AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to monitor access attempts
DROP TRIGGER IF EXISTS monitor_behavior_events_access ON public.lead_behavior_events;
CREATE TRIGGER monitor_behavior_events_access
  AFTER SELECT ON public.lead_behavior_events
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.log_behavior_events_access();