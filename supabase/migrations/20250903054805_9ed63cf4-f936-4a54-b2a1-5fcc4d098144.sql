-- Fix the search path security warning for the function I created
DROP FUNCTION IF EXISTS public.check_rate_limit_enhanced_safe(text, text, integer, integer);

-- Recreate the function with proper search path
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced_safe(
  p_identifier text, 
  p_category text DEFAULT 'default'::text, 
  p_max_requests integer DEFAULT 10, 
  p_window_minutes integer DEFAULT 60
) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $function$
DECLARE
  window_start_time timestamp with time zone;
  current_count integer;
BEGIN
  -- Handle null or empty identifier (sandbox fallback)
  IF p_identifier IS NULL OR p_identifier = '' THEN
    p_identifier := 'sandbox-unknown';
  END IF;

  window_start_time := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Clean up old rate limit records (with error handling)
  BEGIN
    DELETE FROM rate_limits 
    WHERE window_start < window_start_time - interval '1 day';
  EXCEPTION WHEN OTHERS THEN
    -- If cleanup fails, continue but log it
    RAISE LOG 'Rate limit cleanup failed: %', SQLERRM;
  END;
  
  -- Get current count for this identifier and category (with error handling)
  BEGIN
    SELECT COALESCE(SUM(request_count), 0) INTO current_count
    FROM rate_limits
    WHERE identifier = p_identifier 
      AND category = p_category
      AND window_start >= window_start_time;
  EXCEPTION WHEN OTHERS THEN
    -- If rate_limits table doesn't exist or fails, allow the request
    RAISE LOG 'Rate limit check failed, allowing request: %', SQLERRM;
    RETURN true;
  END;
  
  -- If limit exceeded, log and return false
  IF current_count >= p_max_requests THEN
    BEGIN
      PERFORM log_security_event(
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
    EXCEPTION WHEN OTHERS THEN
      -- If logging fails, continue
      RAISE LOG 'Security event logging failed: %', SQLERRM;
    END;
    RETURN false;
  END IF;
  
  -- Increment counter (with error handling)
  BEGIN
    INSERT INTO rate_limits (identifier, category, request_count, window_start)
    VALUES (p_identifier, p_category, 1, now())
    ON CONFLICT (identifier, category) 
    DO UPDATE SET 
      request_count = rate_limits.request_count + 1,
      updated_at = now();
  EXCEPTION WHEN OTHERS THEN
    -- If rate limit table insert fails, still allow the request but log
    RAISE LOG 'Rate limit increment failed, allowing request: %', SQLERRM;
  END;
  
  RETURN true;
END;
$function$;