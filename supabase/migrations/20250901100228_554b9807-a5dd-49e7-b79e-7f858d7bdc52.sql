-- Fix security vulnerability in lead_behavior_events table
-- Remove public access to sensitive visitor tracking data

-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Admins can view behavior events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "Admins only can manage lead behavior events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "Admins can delete behavior events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "Admins can update behavior events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "Authenticated systems can insert behavior events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "Secure behavior events insert" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "SECURE_admin_only_view_behavior_events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "SECURE_service_role_view_behavior_events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "SECURE_admin_update_behavior_events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "SECURE_admin_delete_behavior_events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "SECURE_tracking_insert_only" ON public.lead_behavior_events;

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