-- =====================================================
-- PASO 0: Arreglar función de seguridad rota
-- Primero DROP y luego CREATE con el parámetro renombrado
-- =====================================================

-- Eliminar la función existente
DROP FUNCTION IF EXISTS public.log_critical_security_violation(text, text, jsonb);

-- Recrear con la firma correcta
CREATE OR REPLACE FUNCTION public.log_critical_security_violation(
  violation_type TEXT,
  target_table TEXT,
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  -- Log usando solo columnas que existen en security_events
  INSERT INTO public.security_events (
    event_type,
    severity,
    user_id,
    ip_address,
    details
  ) VALUES (
    violation_type,
    'critical',
    auth.uid(),
    inet_client_addr(),
    jsonb_build_object(
      'timestamp', now(),
      'user_role', auth.role(),
      'target_table', target_table,
      'action', 'SECURITY_VIOLATION',
      'violation_details', details
    )
  );

  -- Log crítico en PostgreSQL para alerta inmediata
  RAISE WARNING 'CRITICAL_SECURITY_VIOLATION: % on table % - User: % - Details: %', 
    violation_type, target_table, auth.uid(), details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;