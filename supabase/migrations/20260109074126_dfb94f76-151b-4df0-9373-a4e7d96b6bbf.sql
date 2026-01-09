-- =====================================================
-- FASE 1 & 2: SEGURIDAD DE TOKENS PARA VALUACIONES
-- =====================================================

-- 1. Nueva tabla para tokens de acceso compartido (separada de PII)
CREATE TABLE IF NOT EXISTS valuation_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_id UUID NOT NULL REFERENCES company_valuations(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
  max_views INTEGER DEFAULT 3,
  views_count INTEGER DEFAULT 0,
  revoked_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by_ip INET,
  
  CONSTRAINT valid_views CHECK (views_count <= max_views OR max_views IS NULL)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_valuation_share_tokens_hash ON valuation_share_tokens(token_hash);
CREATE INDEX idx_valuation_share_tokens_valuation ON valuation_share_tokens(valuation_id);
CREATE INDEX idx_valuation_share_tokens_expires ON valuation_share_tokens(expires_at) WHERE revoked_at IS NULL;

-- 2. Tabla de auditoría de accesos
CREATE TABLE IF NOT EXISTS token_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES valuation_share_tokens(id) ON DELETE SET NULL,
  valuation_id UUID REFERENCES company_valuations(id) ON DELETE SET NULL,
  token_hash_prefix TEXT, -- Solo primeros 8 chars para debugging
  access_ip INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_token_access_log_token ON token_access_log(token_id);
CREATE INDEX idx_token_access_log_accessed ON token_access_log(accessed_at);
CREATE INDEX idx_token_access_log_ip ON token_access_log(access_ip);

-- 3. RLS para las nuevas tablas
ALTER TABLE valuation_share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_access_log ENABLE ROW LEVEL SECURITY;

-- Solo service_role puede acceder directamente a tokens
CREATE POLICY "Service role access to share tokens"
ON valuation_share_tokens
FOR ALL
USING (auth.role() = 'service_role');

-- Admins pueden ver logs de acceso
CREATE POLICY "Admin access to token logs"
ON token_access_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Service role puede insertar logs
CREATE POLICY "Service role insert token logs"
ON token_access_log
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 4. Función para validar token de forma segura
CREATE OR REPLACE FUNCTION validate_share_token(
  p_token_hash TEXT,
  p_ip INET DEFAULT NULL
)
RETURNS TABLE (
  valuation_id UUID,
  is_valid BOOLEAN,
  failure_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_record RECORD;
  v_result_valid BOOLEAN := false;
  v_result_reason TEXT := NULL;
  v_valuation_id UUID := NULL;
BEGIN
  -- Buscar token
  SELECT t.*, t.valuation_id as val_id
  INTO v_token_record
  FROM valuation_share_tokens t
  WHERE t.token_hash = p_token_hash;
  
  IF NOT FOUND THEN
    v_result_reason := 'TOKEN_NOT_FOUND';
  ELSIF v_token_record.revoked_at IS NOT NULL THEN
    v_result_reason := 'TOKEN_REVOKED';
    v_valuation_id := v_token_record.val_id;
  ELSIF v_token_record.expires_at < now() THEN
    v_result_reason := 'TOKEN_EXPIRED';
    v_valuation_id := v_token_record.val_id;
  ELSIF v_token_record.max_views IS NOT NULL AND v_token_record.views_count >= v_token_record.max_views THEN
    v_result_reason := 'MAX_VIEWS_EXCEEDED';
    v_valuation_id := v_token_record.val_id;
  ELSE
    v_result_valid := true;
    v_valuation_id := v_token_record.val_id;
    
    -- Incrementar contador de vistas y actualizar último acceso
    UPDATE valuation_share_tokens
    SET views_count = views_count + 1,
        last_accessed_at = now()
    WHERE id = v_token_record.id;
  END IF;
  
  -- Registrar intento de acceso
  INSERT INTO token_access_log (
    token_id,
    valuation_id,
    token_hash_prefix,
    access_ip,
    success,
    failure_reason
  ) VALUES (
    v_token_record.id,
    v_valuation_id,
    LEFT(p_token_hash, 8),
    p_ip,
    v_result_valid,
    v_result_reason
  );
  
  RETURN QUERY SELECT v_valuation_id, v_result_valid, v_result_reason;
END;
$$;

-- 5. Función para crear token seguro (llamada desde Edge Function)
CREATE OR REPLACE FUNCTION create_share_token(
  p_valuation_id UUID,
  p_token_hash TEXT,
  p_expires_minutes INTEGER DEFAULT 30,
  p_max_views INTEGER DEFAULT 3,
  p_ip INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_id UUID;
BEGIN
  INSERT INTO valuation_share_tokens (
    valuation_id,
    token_hash,
    expires_at,
    max_views,
    created_by_ip
  ) VALUES (
    p_valuation_id,
    p_token_hash,
    now() + (p_expires_minutes || ' minutes')::interval,
    p_max_views,
    p_ip
  )
  RETURNING id INTO v_token_id;
  
  RETURN v_token_id;
END;
$$;

-- 6. Añadir columna token_hash a company_valuations para migración gradual
ALTER TABLE company_valuations 
ADD COLUMN IF NOT EXISTS token_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_valuations_token_hash ON company_valuations(token_hash);

-- 7. IMPORTANTE: Eliminar la política de acceso anónimo insegura
-- Primero verificamos si existe y la eliminamos
DROP POLICY IF EXISTS "CRITICAL_SECURE_token_access" ON company_valuations;

-- 8. Nueva política más restrictiva: anon NO puede acceder directamente
-- El acceso será a través de Edge Function con service_role
CREATE POLICY "Secure_authenticated_access"
ON company_valuations
FOR SELECT
USING (
  -- Usuario autenticado ve sus propias valuaciones
  (auth.uid() IS NOT NULL AND user_id = auth.uid() AND is_deleted = false)
  OR
  -- Admins ven todo
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
  OR
  -- Service role (Edge Functions) puede acceder
  (auth.role() = 'service_role')
);

-- 9. Rate limiting mejorado para la nueva arquitectura
CREATE OR REPLACE FUNCTION check_token_rate_limit(
  p_ip INET,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM token_access_log
  WHERE access_ip = p_ip
    AND accessed_at > now() - (p_window_minutes || ' minutes')::interval
    AND success = false;
  
  RETURN v_count < p_max_attempts;
END;
$$;