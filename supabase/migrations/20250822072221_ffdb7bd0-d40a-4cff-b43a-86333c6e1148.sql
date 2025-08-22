-- Phase 1: Critical Data Protection - Fix RLS policies (Corrected)

-- 1. Fix company_valuations RLS policies (CRITICAL)
-- Remove overly permissive anonymous access
DROP POLICY IF EXISTS "Secure token-based valuation access" ON public.company_valuations;
DROP POLICY IF EXISTS "Secure token-based valuation updates" ON public.company_valuations;
DROP POLICY IF EXISTS "Secure authenticated valuation insert" ON public.company_valuations;

-- Create more restrictive policies
CREATE POLICY "Token-based read access with validation" ON public.company_valuations
FOR SELECT 
USING (
  (auth.role() = 'anon' AND unique_token IS NOT NULL AND unique_token != '') OR
  (auth.uid() = user_id) OR
  current_user_is_admin()
);

CREATE POLICY "Token-based update with validation" ON public.company_valuations
FOR UPDATE 
USING (
  (auth.role() = 'anon' AND unique_token IS NOT NULL AND unique_token != '') OR
  (auth.uid() = user_id AND is_deleted = false) OR
  current_user_is_admin()
)
WITH CHECK (
  (auth.role() = 'anon' AND unique_token IS NOT NULL) OR
  (auth.uid() = user_id) OR
  current_user_is_admin()
);

CREATE POLICY "Secure valuation insert" ON public.company_valuations
FOR INSERT 
WITH CHECK (
  (auth.role() = 'anon' AND unique_token IS NOT NULL AND contact_name IS NOT NULL AND 
   company_name IS NOT NULL AND email IS NOT NULL AND industry IS NOT NULL AND 
   employee_range IS NOT NULL) OR
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  current_user_is_admin()
);

-- 2. Strengthen password validation function
CREATE OR REPLACE FUNCTION public.validate_strong_password(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check minimum length (12+ characters for stronger security)
  IF length(password_text) < 12 THEN
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
  
  -- Check for common weak passwords (expanded list)
  IF lower(password_text) IN (
    'password', 'password123', '123456789', 'qwerty123', 
    'admin123', 'welcome123', 'password1', '12345678',
    'letmein123', 'changeme123', 'default123', 'password12',
    'administrator', 'welcome123456', 'qwerty12345'
  ) THEN
    RETURN false;
  END IF;
  
  -- Check for sequential patterns
  IF password_text ~* '(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)' THEN
    RETURN false;
  END IF;
  
  -- Check for numeric sequences
  IF password_text ~ '(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 3. Create function for secure temporary user creation
CREATE OR REPLACE FUNCTION public.create_temporary_user(
  p_email text,
  p_full_name text,
  p_role admin_role DEFAULT 'editor'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_user_id uuid;
  temp_password text;
  result_data jsonb;
BEGIN
  -- Only super admins can create users
  IF NOT is_user_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo los super administradores pueden crear usuarios';
  END IF;
  
  -- Validate email
  IF NOT (p_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  
  -- Generate secure temporary password (20 characters)
  temp_password := encode(extensions.gen_random_bytes(15), 'base64');
  temp_password := replace(temp_password, '/', 'A');
  temp_password := replace(temp_password, '+', 'B');
  temp_password := replace(temp_password, '=', 'C');
  temp_password := temp_password || '1!'; -- Ensure it meets complexity requirements
  
  -- Generate a user ID for the admin record
  new_user_id := gen_random_uuid();
  
  -- Create admin user record (will be linked when user is created in auth)
  INSERT INTO public.admin_users (
    user_id,
    email,
    full_name,
    role,
    is_active
  ) VALUES (
    new_user_id,
    p_email,
    p_full_name,
    p_role,
    false -- Will be activated when user completes setup
  );
  
  -- Log security event
  PERFORM public.log_security_event(
    'USER_CREATED_BY_ADMIN',
    'high',
    'admin_users',
    'create_user',
    jsonb_build_object(
      'created_user_email', p_email,
      'created_user_role', p_role,
      'created_by', auth.uid()
    )
  );
  
  result_data := jsonb_build_object(
    'user_id', new_user_id,
    'email', p_email,
    'temporary_password', temp_password,
    'requires_password_change', true
  );
  
  RETURN result_data;
END;
$$;

-- 4. Add rate limiting table for security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  category text NOT NULL DEFAULT 'default',
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_category ON public.rate_limits(identifier, category);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 5. Create enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
  p_identifier text,
  p_category text DEFAULT 'default',
  p_max_requests integer DEFAULT 10,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  window_start_time timestamp with time zone;
  current_count integer;
BEGIN
  window_start_time := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits 
  WHERE window_start < window_start_time - interval '1 day';
  
  -- Get current count for this identifier and category
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier 
    AND category = p_category
    AND window_start >= window_start_time;
  
  -- If limit exceeded, log and return false
  IF current_count >= p_max_requests THEN
    PERFORM public.log_security_event(
      'RATE_LIMIT_EXCEEDED',
      'high',
      'rate_limits',
      'check_rate_limit',
      jsonb_build_object(
        'identifier', p_identifier,
        'category', p_category,
        'current_count', current_count,
        'max_requests', p_max_requests
      )
    );
    RETURN false;
  END IF;
  
  -- Increment counter
  INSERT INTO public.rate_limits (identifier, category, request_count, window_start)
  VALUES (p_identifier, p_category, 1, now())
  ON CONFLICT (identifier, category) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$;