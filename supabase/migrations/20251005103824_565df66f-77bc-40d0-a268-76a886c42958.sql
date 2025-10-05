-- ============================================
-- FORTRESS MVP - FASE 1: HARDENING CRÍTICO (v3 - Defensivo)
-- ============================================

-- 1. Arreglar RLS de company_valuations con tokens de un solo uso
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS token_used_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours');

-- Crear índice para búsquedas por unique_token
CREATE INDEX IF NOT EXISTS idx_company_valuations_unique_token 
ON public.company_valuations(unique_token) 
WHERE unique_token IS NOT NULL;

-- Función para validar token (un solo uso, TTL 2 horas)
CREATE OR REPLACE FUNCTION public.validate_valuation_token(_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _valuation_id UUID;
  _token_expires_at TIMESTAMPTZ;
  _token_used_at TIMESTAMPTZ;
BEGIN
  SELECT id, token_expires_at, token_used_at
  INTO _valuation_id, _token_expires_at, _token_used_at
  FROM public.company_valuations
  WHERE unique_token = _token;

  IF _valuation_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF _token_used_at IS NOT NULL THEN
    RETURN NULL;
  END IF;

  IF _token_expires_at < NOW() THEN
    RETURN NULL;
  END IF;

  UPDATE public.company_valuations
  SET token_used_at = NOW()
  WHERE id = _valuation_id;

  RETURN _valuation_id;
END;
$$;

-- 2. Función de seguridad para verificar roles de admin
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
      AND is_active = true
      AND role IN ('admin', 'super_admin')
  );
$$;

-- 3. Tabla de eventos de seguridad (DROP y recrear para evitar conflictos)
DROP TABLE IF EXISTS public.security_events CASCADE;

CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_events_created_at 
ON public.security_events(created_at DESC);

CREATE INDEX idx_security_events_severity 
ON public.security_events(severity) 
WHERE severity IN ('high', 'critical');

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security events"
ON public.security_events
FOR SELECT
USING (public.is_admin_user(auth.uid()));

-- Función para registrar eventos de seguridad
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type TEXT,
  _severity TEXT,
  _details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event_id UUID;
BEGIN
  INSERT INTO public.security_events (event_type, severity, user_id, details)
  VALUES (_event_type, _severity, auth.uid(), _details)
  RETURNING id INTO _event_id;
  
  RETURN _event_id;
END;
$$;

-- 4. Rate limiting table (DROP y recrear para evitar conflictos)
DROP TABLE IF EXISTS public.rate_limits CASCADE;

CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear restricción UNIQUE después de crear la tabla
ALTER TABLE public.rate_limits 
ADD CONSTRAINT rate_limits_identifier_action_window_key 
UNIQUE (identifier, action, window_start);

CREATE INDEX idx_rate_limits_identifier 
ON public.rate_limits(identifier, action, window_start);

-- Función para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _identifier TEXT,
  _action TEXT,
  _max_requests INTEGER DEFAULT 100,
  _window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_count INTEGER;
  _window_start TIMESTAMPTZ;
BEGIN
  _window_start := DATE_TRUNC('minute', NOW()) - (INTERVAL '1 minute' * _window_minutes);
  
  SELECT COALESCE(SUM(count), 0)
  INTO _current_count
  FROM public.rate_limits
  WHERE identifier = _identifier
    AND action = _action
    AND window_start >= _window_start;
  
  IF _current_count >= _max_requests THEN
    PERFORM public.log_security_event(
      'RATE_LIMIT_EXCEEDED',
      'medium',
      jsonb_build_object(
        'identifier', _identifier,
        'action', _action,
        'count', _current_count,
        'limit', _max_requests
      )
    );
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.rate_limits (identifier, action, window_start)
  VALUES (_identifier, _action, _window_start)
  ON CONFLICT (identifier, action, window_start)
  DO UPDATE SET count = rate_limits.count + 1;
  
  RETURN TRUE;
END;
$$;

-- Cleanup de rate limits
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_cleanup_rate_limits ON public.rate_limits;
CREATE TRIGGER trigger_cleanup_rate_limits
AFTER INSERT ON public.rate_limits
EXECUTE FUNCTION public.cleanup_old_rate_limits();