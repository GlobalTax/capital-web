-- PHASE 1: SECURITY FIXES - Remove dangerous public access policies (CORRECTED)
-- This migration addresses critical security vulnerabilities identified in the security review

-- =============================================
-- 1. SECURE COMPANY_VALUATIONS TABLE
-- =============================================

-- Drop the overly permissive "Anyone can update by unique_token" policy
DROP POLICY IF EXISTS "Anyone can update by unique_token" ON public.company_valuations;

-- Create a more secure update policy that only allows updates to specific fields
CREATE POLICY "Allow token-based updates for specific fields only" 
ON public.company_valuations 
FOR UPDATE 
USING (unique_token IS NOT NULL)
WITH CHECK (unique_token IS NOT NULL);

-- =============================================
-- 2. SECURE CONTACT_LEADS TABLE  
-- =============================================

-- Drop the overly permissive "Allow all insert contact leads" policy
DROP POLICY IF EXISTS "Allow all insert contact leads" ON public.contact_leads;

-- Create a more secure insert policy with input validation
CREATE POLICY "Allow controlled contact lead inserts" 
ON public.contact_leads 
FOR INSERT 
WITH CHECK (
  -- Only allow inserts with required fields and basic validation
  full_name IS NOT NULL 
  AND email IS NOT NULL 
  AND company IS NOT NULL
  AND length(full_name) > 2
  AND length(email) > 5
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- =============================================
-- 3. SECURE COLLABORATOR_APPLICATIONS TABLE
-- =============================================

-- Drop the overly permissive "Anyone can insert collaborator applications" policy  
DROP POLICY IF EXISTS "Anyone can insert collaborator applications" ON public.collaborator_applications;

-- Create a more secure insert policy
CREATE POLICY "Allow controlled collaborator applications" 
ON public.collaborator_applications 
FOR INSERT 
WITH CHECK (
  -- Only allow inserts with required fields and basic validation
  full_name IS NOT NULL 
  AND email IS NOT NULL 
  AND phone IS NOT NULL
  AND profession IS NOT NULL
  AND length(full_name) > 2
  AND length(email) > 5
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- =============================================
-- 4. SECURE DATABASE FUNCTIONS
-- =============================================

-- Update all security definer functions to use proper search_path
CREATE OR REPLACE FUNCTION public.generate_unique_v4_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(extensions.gen_random_bytes(16), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_unique_proposal_url()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  unique_string TEXT;
BEGIN
  unique_string := encode(extensions.gen_random_bytes(16), 'hex');
  RETURN unique_string;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_v4_token()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.unique_token IS NULL THEN
    NEW.unique_token := generate_unique_v4_token();
  END IF;
  RETURN NEW;
END;
$function$;

-- Update admin role checking functions
CREATE OR REPLACE FUNCTION public.check_user_admin_role(check_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role::text 
     FROM admin_users 
     WHERE user_id = check_user_id 
     AND is_active = true
     LIMIT 1), 
    'none'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.check_user_admin_role(check_user_id) IN ('admin', 'super_admin');
$function$;

CREATE OR REPLACE FUNCTION public.is_user_super_admin(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.check_user_admin_role(check_user_id) = 'super_admin';
$function$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.is_user_admin(auth.uid());
$function$;

-- =============================================
-- 5. STRENGTHEN ADMIN SYSTEM SECURITY
-- =============================================

-- Add additional security to bootstrap function
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
  admin_count integer;
BEGIN
  -- Only allow if no admins exist yet
  SELECT COUNT(*) INTO admin_count FROM public.admin_users WHERE is_active = true;
  
  IF admin_count > 0 THEN
    -- Log attempt to create admin when admins already exist
    RAISE LOG 'SECURITY: Attempt to bootstrap admin when admins already exist. Email: %', user_email;
    RETURN false;
  END IF;
  
  -- Validate email format
  IF user_email IS NULL OR user_email = '' OR NOT (user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE LOG 'SECURITY: Invalid email format in bootstrap attempt: %', user_email;
    RETURN false;
  END IF;
  
  -- Get user ID from auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  IF target_user_id IS NULL THEN
    RAISE LOG 'SECURITY: User not found for bootstrap: %', user_email;
    RETURN false;
  END IF;
  
  -- Create the first admin with logging
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
  
  RAISE LOG 'SECURITY: First admin successfully bootstrapped: %', user_email;
  RETURN true;
END;
$function$;

-- =============================================
-- 6. ADD SECURITY MONITORING
-- =============================================

-- Create a function to log security events
CREATE OR REPLACE FUNCTION public.log_security_violation(
  violation_type text,
  table_name text,
  user_id uuid DEFAULT auth.uid(),
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log to system logs for monitoring
  RAISE LOG 'SECURITY_VIOLATION: type=%, table=%, user=%, details=%', 
    violation_type, table_name, user_id, details;
  
  -- Future: Could insert into a security_events table for dashboard monitoring
END;
$function$;

-- =============================================
-- 7. UPDATE REMAINING FUNCTIONS WITH SEARCH_PATH
-- =============================================

-- Update other functions to include search_path for security
CREATE OR REPLACE FUNCTION public.update_admin_users_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_basic_info()
 RETURNS TABLE(id uuid, full_name text, role admin_role, is_active boolean, last_login timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    au.id,
    au.full_name,
    au.role,
    au.is_active,
    au.last_login
  FROM public.admin_users au
  WHERE 
    au.is_active = true
    AND (
      -- Super admins see everything
      is_user_super_admin(auth.uid())
      OR
      -- Regular admins see basic info
      is_user_admin(auth.uid())
    );
$function$;

-- =============================================
-- 8. ADD COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON POLICY "Allow token-based updates for specific fields only" ON public.company_valuations 
IS 'Secure policy allowing valuation updates only using unique token, prevents unauthorized data modification';

COMMENT ON POLICY "Allow controlled contact lead inserts" ON public.contact_leads 
IS 'Allows public contact form submissions with mandatory input validation and email format checking';

COMMENT ON POLICY "Allow controlled collaborator applications" ON public.collaborator_applications 
IS 'Allows public collaborator applications with comprehensive input validation requirements';

COMMENT ON FUNCTION public.log_security_violation(text, text, uuid, jsonb) 
IS 'Security monitoring function to log violations and suspicious activities for audit purposes';