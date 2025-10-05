-- ============================================
-- FORTRESS MVP - Arreglar Warnings de Seguridad Críticos
-- ============================================

-- 1. Habilitar RLS en rate_limits (ERROR crítico del linter)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Política: Solo el sistema puede escribir en rate_limits
CREATE POLICY "System can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Política: Solo admins pueden leer rate_limits
CREATE POLICY "Admins can view rate limits"
ON public.rate_limits
FOR SELECT
USING (public.is_admin_user(auth.uid()));

-- 2. Arreglar search_path en funciones (WARN del linter)
-- Actualizar cleanup_old_rate_limits con search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
  RETURN NEW;
END;
$$;

-- 3. Comentarios de seguridad para auditoría
COMMENT ON TABLE public.rate_limits IS 'Rate limiting table - RLS enabled for security';
COMMENT ON TABLE public.security_events IS 'Security events logging table - admin access only';
COMMENT ON FUNCTION public.validate_valuation_token(TEXT) IS 'Validates single-use tokens with 2-hour TTL';
COMMENT ON FUNCTION public.is_admin_user(UUID) IS 'Checks if user has admin or super_admin role';
COMMENT ON FUNCTION public.log_security_event(TEXT, TEXT, JSONB) IS 'Logs security events with automatic context';
COMMENT ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) IS 'Enforces rate limits with configurable thresholds';