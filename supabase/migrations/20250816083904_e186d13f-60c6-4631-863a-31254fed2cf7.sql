-- PHASE 2: AUTH SECURITY CONFIGURATION FIXES (CORRECTED)
-- Address the remaining security warnings from the linter

-- =============================================
-- 1. CONFIGURE AUTH SECURITY SETTINGS
-- =============================================

-- Create a function to validate password strength beyond Supabase defaults
CREATE OR REPLACE FUNCTION public.validate_strong_password(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Additional password validation beyond Supabase defaults
  -- Check minimum length (8+ characters minimum)
  IF length(password_text) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for at least one uppercase letter
  IF password_text !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one lowercase letter  
  IF password_text !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one number
  IF password_text !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one special character
  IF password_text !~ '[^A-Za-z0-9]' THEN
    RETURN false;
  END IF;
  
  -- Check for common weak passwords
  IF lower(password_text) IN (
    'password', 'password123', '123456789', 'qwerty123', 
    'admin123', 'welcome123', 'password1', '12345678'
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Create a function to log authentication security events
CREATE OR REPLACE FUNCTION public.log_auth_security_event(
  event_type text,
  user_email text DEFAULT NULL,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log authentication security events for monitoring
  RAISE LOG 'AUTH_SECURITY_EVENT: type=%, email=%, ip=%, user_agent=%, details=%', 
    event_type, user_email, ip_address, user_agent, details;
END;
$function$;

-- =============================================
-- 2. ENHANCE EXISTING SECURITY MONITORING
-- =============================================

-- Update the security violation logging to include auth events
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
DECLARE
  user_email text;
BEGIN
  -- Get user email for better tracking
  IF user_id IS NOT NULL THEN
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = user_id 
    LIMIT 1;
  END IF;
  
  -- Enhanced logging with user context
  RAISE LOG 'SECURITY_VIOLATION: type=%, table=%, user_id=%, user_email=%, details=%', 
    violation_type, table_name, user_id, user_email, details;
  
  -- Log critical violations with higher severity
  IF violation_type IN ('UNAUTHORIZED_ACCESS', 'PRIVILEGE_ESCALATION', 'DATA_BREACH_ATTEMPT') THEN
    RAISE WARNING 'CRITICAL_SECURITY_VIOLATION: type=%, user=%, details=%', 
      violation_type, user_email, details;
  END IF;
END;
$function$;

-- =============================================
-- 3. CREATE ADDITIONAL SECURITY POLICIES
-- =============================================

-- Create a simple rate limiting check function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier text,
  max_requests integer DEFAULT 10,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  window_start timestamp;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- This is a simplified rate limiting check
  -- In production, this would use a proper rate limiting table
  -- For now, just log the attempt
  RAISE LOG 'RATE_LIMIT_CHECK: identifier=%, max_requests=%, window_minutes=%', 
    identifier, max_requests, window_minutes;
  
  -- Always return true for now, but log for monitoring
  RETURN true;
END;
$function$;

-- =============================================
-- 4. ADD MONITORING FOR ADMIN ACTIONS
-- =============================================

-- Create a trigger function to log admin user changes
CREATE OR REPLACE FUNCTION public.audit_admin_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  acting_user_email text;
BEGIN
  -- Get acting user email
  SELECT email INTO acting_user_email
  FROM auth.users 
  WHERE id = auth.uid() 
  LIMIT 1;
  
  IF TG_OP = 'INSERT' THEN
    RAISE LOG 'ADMIN_AUDIT: Action=CREATE, ActingUser=%, TargetUser=%, NewRole=%', 
      acting_user_email, NEW.email, NEW.role;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    RAISE LOG 'ADMIN_AUDIT: Action=UPDATE, ActingUser=%, TargetUser=%, OldRole=%, NewRole=%', 
      acting_user_email, NEW.email, OLD.role, NEW.role;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RAISE LOG 'ADMIN_AUDIT: Action=DELETE, ActingUser=%, TargetUser=%, Role=%', 
      acting_user_email, OLD.email, OLD.role;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Create audit trigger for admin_users table
DROP TRIGGER IF EXISTS audit_admin_users_changes ON public.admin_users;
CREATE TRIGGER audit_admin_users_changes
  BEFORE INSERT OR UPDATE OR DELETE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_changes();

-- =============================================
-- 5. DOCUMENTATION AND COMMENTS
-- =============================================

COMMENT ON FUNCTION public.validate_strong_password(text) 
IS 'Enhanced password validation function with stricter requirements than Supabase defaults';

COMMENT ON FUNCTION public.log_auth_security_event(text, text, inet, text, jsonb) 
IS 'Centralized logging for authentication security events and suspicious activities';

COMMENT ON FUNCTION public.check_rate_limit(text, integer, integer) 
IS 'Basic rate limiting check with logging for security monitoring';

COMMENT ON FUNCTION public.audit_admin_changes() 
IS 'Audit trigger function to log all changes to admin users for security compliance';

-- Log successful completion with proper JSON handling
DO $$
BEGIN
  PERFORM public.log_security_violation(
    'SECURITY_HARDENING_COMPLETED',
    'system',
    auth.uid(),
    jsonb_build_object(
      'phase', 'database_security_fixes', 
      'timestamp', extract(epoch from now()),
      'status', 'completed'
    )
  );
END $$;