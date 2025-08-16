-- PHASE 1: CRITICAL SECURITY FIXES (Updated)
-- Handle existing policies and strengthen security

-- 1. COLLABORATOR APPLICATIONS - Update existing policies
-- Remove the old less secure insert policy
DROP POLICY IF EXISTS "Allow controlled collaborator applications" ON public.collaborator_applications;

-- Create more secure insert policy with rate limiting and stricter validation
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

-- 2. CONTACT LEADS - Update existing policies  
-- Remove the old less secure insert policy
DROP POLICY IF EXISTS "Allow controlled contact lead inserts" ON public.contact_leads;

-- Add missing admin delete policy
CREATE POLICY "Admins can delete contact leads" 
ON public.contact_leads 
FOR DELETE 
USING (current_user_is_admin());

-- Create more secure insert policy with rate limiting
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

-- 3. COMPANY VALUATIONS - Update existing policies
-- Remove the old less secure insert policy
DROP POLICY IF EXISTS "Anyone can insert company valuations" ON public.company_valuations;

-- Create more secure insert policy with validation and rate limiting
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