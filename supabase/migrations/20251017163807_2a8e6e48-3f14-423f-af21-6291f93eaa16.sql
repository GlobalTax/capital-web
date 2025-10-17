-- ============================================================================
-- FASE 1: AUDITORÍA AUTOMÁTICA EN admin_users
-- ============================================================================

-- Trigger para auditoría automática de cambios en admin_users
-- Este trigger captura INSERT, UPDATE y DELETE automáticamente

-- Verificar que la tabla audit_logs existe y tiene los triggers necesarios
-- La función audit_trigger_function ya existe en el sistema

-- Aplicar trigger de auditoría a admin_users si no existe
DROP TRIGGER IF EXISTS audit_admin_users_changes ON public.admin_users;

CREATE TRIGGER audit_admin_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

-- Comentarios para documentación
COMMENT ON TRIGGER audit_admin_users_changes ON public.admin_users IS
'Trigger automático que registra todos los cambios (INSERT, UPDATE, DELETE) en admin_users en la tabla audit_logs';

-- ============================================================================
-- LOGGING DE SEGURIDAD
-- ============================================================================

DO $$
BEGIN
  PERFORM public.log_security_event(
    'AUTOMATIC_AUDIT_ENABLED',
    'high',
    'admin_users',
    'CREATE TRIGGER',
    jsonb_build_object(
      'migration', 'phase_1_automatic_audit',
      'trigger_name', 'audit_admin_users_changes',
      'tables_monitored', ARRAY['admin_users'],
      'captures', ARRAY['INSERT', 'UPDATE', 'DELETE'],
      'target_table', 'audit_logs',
      'timestamp', now(),
      'note', 'Auditoría automática activada para todos los cambios en usuarios admin'
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not log security event: %', SQLERRM;
END $$;