-- Fix security linter warnings: Function Search Path Mutable
-- Set search_path for security functions to prevent SQL injection

-- Fix log_critical_security_event function
CREATE OR REPLACE FUNCTION public.log_critical_security_event(
  event_type text,
  table_name text,
  operation text,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.log_security_event(
    event_type,
    'high',
    table_name,
    operation,
    jsonb_build_object(
      'user_id', auth.uid(),
      'user_role', auth.role(), 
      'ip_address', inet_client_addr(),
      'timestamp', now(),
      'details', details
    )
  );
  
  RAISE LOG 'CRITICAL_SECURITY_EVENT: % on table % - Operation: % - User: % - IP: %', 
    event_type, table_name, operation, auth.uid(), inet_client_addr();
END;
$$;

-- Fix monitor_data_mutations function
CREATE OR REPLACE FUNCTION public.monitor_data_mutations()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.log_critical_security_event(
    'SENSITIVE_DATA_MUTATION',
    TG_TABLE_NAME,
    TG_OP,
    jsonb_build_object(
      'record_id', COALESCE(NEW.id, OLD.id),
      'mutation_type', TG_OP
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;