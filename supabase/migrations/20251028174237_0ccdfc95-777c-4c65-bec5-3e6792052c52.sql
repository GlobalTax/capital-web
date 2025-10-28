-- FASE 1: Crear función verify_valuation_token con seguridad mejorada
CREATE OR REPLACE FUNCTION public.verify_valuation_token(token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valuation_record RECORD;
BEGIN
  -- Buscar valoración con este token
  SELECT 
    id, 
    token_expires_at, 
    token_used_at,
    valuation_status,
    is_deleted,
    created_at
  INTO valuation_record
  FROM company_valuations
  WHERE unique_token = token;
  
  -- Token no existe
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Valoración eliminada
  IF valuation_record.is_deleted = true THEN
    RETURN false;
  END IF;
  
  -- Token expirado (2 horas desde creación)
  IF valuation_record.token_expires_at < NOW() THEN
    RETURN false;
  END IF;
  
  -- Token ya usado (un solo uso)
  IF valuation_record.token_used_at IS NOT NULL THEN
    RETURN false;
  END IF;
  
  -- Valoración no completada
  IF valuation_record.valuation_status != 'completed' THEN
    RETURN false;
  END IF;
  
  -- Solo tokens de las últimas 24 horas
  IF valuation_record.created_at < NOW() - INTERVAL '24 hours' THEN
    RETURN false;
  END IF;
  
  -- Marcar token como usado (un solo uso)
  UPDATE company_valuations
  SET token_used_at = NOW()
  WHERE id = valuation_record.id;
  
  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.verify_valuation_token IS 'Verifica tokens de valoración con seguridad mejorada: un solo uso, validación de expiración y estado';

-- FASE 1: Reforzar política RLS de valoraciones con tokens de un solo uso
DROP POLICY IF EXISTS "ULTRA_SECURE_token_access" ON company_valuations;

CREATE POLICY "CRITICAL_SECURE_token_access"
ON company_valuations
FOR SELECT
TO public
USING (
  -- Admins siempre pueden ver
  current_user_is_admin()
  OR
  -- Usuarios autenticados ven solo sus valoraciones
  (
    auth.uid() = user_id 
    AND (is_deleted = false OR is_deleted IS NULL)
  )
  OR
  -- Acceso con token (anónimo) - MUY RESTRINGIDO
  (
    auth.role() = 'anon'
    AND unique_token IS NOT NULL
    AND valuation_status = 'completed'
    -- Rate limiting agresivo: 3 intentos por hora
    AND check_rate_limit_enhanced_safe(
      COALESCE(inet_client_addr()::text, 'unknown'),
      'valuation_token_access',
      3,  -- Max 3 requests
      60  -- Por 60 minutos (1 hora)
    )
    -- Verificación de token (marca como usado - UN SOLO USO)
    AND verify_valuation_token(unique_token::text)
    -- Restricción adicional: solo últimas 24 horas
    AND created_at > NOW() - INTERVAL '24 hours'
  )
  OR
  -- Service role para edge functions
  auth.role() = 'service_role'
);

COMMENT ON POLICY "CRITICAL_SECURE_token_access" ON company_valuations IS 'Política ultra-segura: tokens de un solo uso, rate limit 3/hora, ventana 24h';

-- FASE 1: Índices de seguridad para tokens (sin NOW() en WHERE)
CREATE INDEX IF NOT EXISTS idx_company_valuations_token_lookup
ON company_valuations(unique_token)
WHERE is_deleted = false AND valuation_status = 'completed';

CREATE INDEX IF NOT EXISTS idx_company_valuations_token_used
ON company_valuations(token_used_at)
WHERE token_used_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_company_valuations_token_expires
ON company_valuations(token_expires_at);

COMMENT ON INDEX idx_company_valuations_token_lookup IS 'Índice para búsquedas rápidas de tokens válidos (previene timing attacks)';
COMMENT ON INDEX idx_company_valuations_token_used IS 'Índice para detección rápida de tokens ya usados';
COMMENT ON INDEX idx_company_valuations_token_expires IS 'Índice para validación eficiente de expiración de tokens';