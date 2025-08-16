-- CRITICAL SECURITY FIXES - Simplified Approach
-- Focus on removing public access from sensitive data

-- 1. Remove overly permissive insert policies and replace with secure ones
DROP POLICY IF EXISTS "Allow controlled collaborator applications" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Allow controlled contact lead inserts" ON public.contact_leads;
DROP POLICY IF EXISTS "Anyone can insert company valuations" ON public.company_valuations;

-- 2. Create secure insert policies with strict validation

-- COLLABORATOR APPLICATIONS - Secure insert with validation
CREATE POLICY "Secure collaborator applications insert" 
ON public.collaborator_applications 
FOR INSERT 
WITH CHECK (
  full_name IS NOT NULL AND 
  email IS NOT NULL AND 
  phone IS NOT NULL AND 
  profession IS NOT NULL AND 
  length(trim(full_name)) >= 2 AND 
  length(trim(email)) >= 5 AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(trim(profession)) >= 2
);

-- CONTACT LEADS - Secure insert with validation
CREATE POLICY "Secure contact leads insert" 
ON public.contact_leads 
FOR INSERT 
WITH CHECK (
  full_name IS NOT NULL AND 
  email IS NOT NULL AND 
  company IS NOT NULL AND 
  length(trim(full_name)) >= 2 AND 
  length(trim(email)) >= 5 AND 
  length(trim(company)) >= 2 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Add missing admin delete policy for contact leads
CREATE POLICY "Admins can delete contact leads" 
ON public.contact_leads 
FOR DELETE 
USING (current_user_is_admin());

-- COMPANY VALUATIONS - Secure insert with validation
CREATE POLICY "Secure valuation insert" 
ON public.company_valuations 
FOR INSERT 
WITH CHECK (
  contact_name IS NOT NULL AND 
  company_name IS NOT NULL AND 
  email IS NOT NULL AND 
  industry IS NOT NULL AND 
  employee_range IS NOT NULL AND
  length(trim(contact_name)) >= 2 AND 
  length(trim(company_name)) >= 2 AND 
  length(trim(email)) >= 5 AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 3. Create security monitoring table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  table_name TEXT,
  action_attempted TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Security events policies
CREATE POLICY "Super admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (is_user_super_admin(auth.uid()));

CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- 4. Create security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_table_name TEXT DEFAULT NULL,
  p_action_attempted TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) 
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (
    event_type,
    severity,
    user_id,
    ip_address,
    table_name,
    action_attempted,
    details
  ) VALUES (
    p_event_type,
    p_severity,
    auth.uid(),
    inet_client_addr(),
    p_table_name,
    p_action_attempted,
    p_details
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log to PostgreSQL logs if security_events table is unavailable
    RAISE LOG 'SECURITY_EVENT: % - % - % - %', p_event_type, p_severity, p_table_name, p_details;
END;
$$;

-- 5. Enhanced bootstrap admin function with security logging
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id uuid;
  admin_count integer;
BEGIN
  -- Log bootstrap attempt
  PERFORM public.log_security_event(
    'ADMIN_BOOTSTRAP_ATTEMPT',
    'high',
    'admin_users',
    'bootstrap_admin',
    jsonb_build_object('attempted_email', user_email)
  );
  
  -- Only allow if no admins exist yet
  SELECT COUNT(*) INTO admin_count FROM public.admin_users WHERE is_active = true;
  
  IF admin_count > 0 THEN
    PERFORM public.log_security_event(
      'ADMIN_BOOTSTRAP_DENIED',
      'critical',
      'admin_users', 
      'bootstrap_admin',
      jsonb_build_object('reason', 'admins_already_exist', 'attempted_email', user_email)
    );
    RETURN false;
  END IF;
  
  -- Validate email format with stricter rules
  IF user_email IS NULL OR user_email = '' OR 
     NOT (user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') OR
     length(user_email) < 5 OR length(user_email) > 254 THEN
    PERFORM public.log_security_event(
      'ADMIN_BOOTSTRAP_INVALID_EMAIL',
      'high',
      'admin_users',
      'bootstrap_admin', 
      jsonb_build_object('attempted_email', user_email)
    );
    RETURN false;
  END IF;
  
  -- Get user ID from auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  IF target_user_id IS NULL THEN
    PERFORM public.log_security_event(
      'ADMIN_BOOTSTRAP_USER_NOT_FOUND',
      'high',
      'admin_users',
      'bootstrap_admin',
      jsonb_build_object('attempted_email', user_email)
    );
    RETURN false;
  END IF;
  
  -- Create the first admin
  INSERT INTO public.admin_users (
    user_id, 
    email, 
    role, 
    is_active
  ) VALUES (
    target_user_id, 
    user_email, 
    'super_admin', 
    true
  );
  
  PERFORM public.log_security_event(
    'ADMIN_BOOTSTRAP_SUCCESS',
    'critical',
    'admin_users',
    'bootstrap_admin',
    jsonb_build_object('new_admin_email', user_email, 'user_id', target_user_id)
  );
  
  RETURN true;
END;
$$;