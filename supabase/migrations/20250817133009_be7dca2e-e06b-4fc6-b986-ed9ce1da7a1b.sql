-- Fix security issue: Function Search Path Mutable
-- Update the logging function to have a secure search_path

CREATE OR REPLACE FUNCTION public.log_valuation_mutations()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log INSERT/UPDATE/DELETE operations on sensitive data
  PERFORM public.log_security_event(
    'VALUATION_DATA_MUTATION',
    CASE 
      WHEN auth.role() = 'anon' AND TG_OP != 'INSERT' THEN 'critical'
      WHEN auth.role() = 'anon' THEN 'high' 
      ELSE 'info' 
    END,
    'company_valuations',
    TG_OP,
    jsonb_build_object(
      'user_role', auth.role(),
      'user_id', auth.uid(),
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;