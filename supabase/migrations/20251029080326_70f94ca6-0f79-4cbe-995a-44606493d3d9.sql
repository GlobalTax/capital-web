-- FASE 8 - MIGRACIÓN 6: Arreglar función SECURITY DEFINER restante
-- Agregar SET search_path a log_behavior_access_violation

CREATE OR REPLACE FUNCTION public.log_behavior_access_violation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM public.log_security_event(
    'UNAUTHORIZED_BEHAVIOR_DATA_ACCESS_ATTEMPT',
    'critical',
    'lead_behavior_events',
    'SELECT',
    jsonb_build_object(
      'user_id', auth.uid(),
      'user_role', auth.role(),
      'ip_address', inet_client_addr(),
      'timestamp', now(),
      'message', 'Attempt to access visitor tracking data blocked by RLS'
    )
  );
END;
$function$;

COMMENT ON FUNCTION public.log_behavior_access_violation() IS 
'SECURITY: Hardened with SET search_path to prevent search_path poisoning attacks (Phase 8)';