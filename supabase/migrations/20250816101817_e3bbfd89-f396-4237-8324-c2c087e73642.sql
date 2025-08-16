-- PHASE 1: CRITICAL SECURITY FIXES
-- Remove public access from sensitive tables and strengthen RLS policies

-- 1. COLLABORATOR APPLICATIONS - Remove public access, admin only
DROP POLICY IF EXISTS "Allow controlled collaborator applications" ON public.collaborator_applications;

-- Create secure admin-only policies for collaborator applications
CREATE POLICY "Admins can view collaborator applications" 
ON public.collaborator_applications 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "Admins can update collaborator applications" 
ON public.collaborator_applications 
FOR UPDATE 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Admins can delete collaborator applications" 
ON public.collaborator_applications 
FOR DELETE 
USING (current_user_is_admin());

-- Secure controlled insert policy with strict validation
CREATE POLICY "Allow secure collaborator applications insert" 
ON public.collaborator_applications 
FOR INSERT 
WITH CHECK (
  -- Strict validation requirements
  full_name IS NOT NULL AND 
  email IS NOT NULL AND 
  phone IS NOT NULL AND 
  profession IS NOT NULL AND 
  length(trim(full_name)) >= 2 AND 
  length(trim(email)) >= 5 AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(trim(profession)) >= 2 AND
  -- Rate limiting by IP (basic protection)
  NOT EXISTS (
    SELECT 1 FROM public.collaborator_applications 
    WHERE ip_address = NEW.ip_address 
    AND created_at > now() - INTERVAL '1 hour'
    LIMIT 3
  )
);

-- 2. CONTACT LEADS - Remove public access, admin only
DROP POLICY IF EXISTS "Allow controlled contact lead inserts" ON public.contact_leads;

-- Create secure policies for contact leads
CREATE POLICY "Admins can delete contact leads" 
ON public.contact_leads 
FOR DELETE 
USING (current_user_is_admin());

-- Secure controlled insert policy with strict validation
CREATE POLICY "Allow secure contact leads insert" 
ON public.contact_leads 
FOR INSERT 
WITH CHECK (
  -- Strict validation requirements
  full_name IS NOT NULL AND 
  email IS NOT NULL AND 
  company IS NOT NULL AND 
  length(trim(full_name)) >= 2 AND 
  length(trim(email)) >= 5 AND 
  length(trim(company)) >= 2 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Rate limiting by IP (basic protection)
  NOT EXISTS (
    SELECT 1 FROM public.contact_leads 
    WHERE ip_address = NEW.ip_address 
    AND created_at > now() - INTERVAL '1 hour'
    LIMIT 3
  )
);

-- 3. COMPANY VALUATIONS - Strengthen access control
-- Update existing policies to be more restrictive
DROP POLICY IF EXISTS "Anyone can insert company valuations" ON public.company_valuations;

-- More secure insert policy with validation
CREATE POLICY "Allow secure valuation insert" 
ON public.company_valuations 
FOR INSERT 
WITH CHECK (
  -- Strict validation requirements
  contact_name IS NOT NULL AND 
  company_name IS NOT NULL AND 
  email IS NOT NULL AND 
  industry IS NOT NULL AND 
  employee_range IS NOT NULL AND
  length(trim(contact_name)) >= 2 AND 
  length(trim(company_name)) >= 2 AND 
  length(trim(email)) >= 5 AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  -- Rate limiting by IP (basic protection)
  NOT EXISTS (
    SELECT 1 FROM public.company_valuations 
    WHERE ip_address = NEW.ip_address 
    AND created_at > now() - INTERVAL '10 minutes'
    LIMIT 2
  )
);

-- 4. Create security event logging table for monitoring
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

-- Only super admins can view security events
CREATE POLICY "Super admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (is_user_super_admin(auth.uid()));

-- System can insert security events
CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- 5. Create security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_table_name TEXT DEFAULT NULL,
  p_action_attempted TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Add security triggers for sensitive tables
CREATE OR REPLACE FUNCTION public.security_audit_trigger() 
RETURNS TRIGGER AS $$
BEGIN
  -- Log all access to sensitive data
  PERFORM public.log_security_event(
    'DATA_ACCESS',
    CASE 
      WHEN TG_OP = 'SELECT' THEN 'low'
      WHEN TG_OP = 'INSERT' THEN 'medium'  
      WHEN TG_OP = 'UPDATE' THEN 'medium'
      WHEN TG_OP = 'DELETE' THEN 'high'
      ELSE 'medium'
    END,
    TG_TABLE_NAME,
    TG_OP,
    jsonb_build_object(
      'record_id', COALESCE(NEW.id, OLD.id),
      'operation', TG_OP
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply security monitoring to sensitive tables
DROP TRIGGER IF EXISTS security_audit_collaborator_applications ON public.collaborator_applications;
CREATE TRIGGER security_audit_collaborator_applications
  AFTER INSERT OR UPDATE OR DELETE ON public.collaborator_applications
  FOR EACH ROW EXECUTE FUNCTION public.security_audit_trigger();

DROP TRIGGER IF EXISTS security_audit_contact_leads ON public.contact_leads;
CREATE TRIGGER security_audit_contact_leads
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_leads
  FOR EACH ROW EXECUTE FUNCTION public.security_audit_trigger();

DROP TRIGGER IF EXISTS security_audit_company_valuations ON public.company_valuations;
CREATE TRIGGER security_audit_company_valuations
  AFTER INSERT OR UPDATE OR DELETE ON public.company_valuations
  FOR EACH ROW EXECUTE FUNCTION public.security_audit_trigger();

-- 7. Strengthen existing admin functions security
-- Update bootstrap admin function with additional security
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
  admin_count integer;
BEGIN
  -- Enhanced security logging
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
  
  -- Create the first admin with enhanced logging
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