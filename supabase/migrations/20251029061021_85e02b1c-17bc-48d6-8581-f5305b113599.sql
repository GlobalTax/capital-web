-- =====================================================
-- FASE 6: DATABASE HARDENING - VIEWS Y EXTENSIONES
-- =====================================================

-- 1. Revisar y documentar Security Definer Views
-- No podemos cambiar las vistas existentes sin conocer su lógica completa
-- pero podemos documentarlas para revisión manual

COMMENT ON VIEW public.admin_security_alerts IS 
'⚠️ SECURITY REVIEW REQUIRED: This view may use SECURITY DEFINER. Verify that it does not expose sensitive data or bypass RLS policies inappropriately.';

-- 2. Crear función para auditar security definer objects
CREATE OR REPLACE FUNCTION public.audit_security_definer_objects()
RETURNS TABLE(
  object_type text,
  object_name text,
  security_level text,
  recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'FUNCTION'::text as object_type,
    proname::text as object_name,
    CASE 
      WHEN prosecdef AND NOT (proconfig @> ARRAY['search_path=public']) 
        THEN 'HIGH RISK'
      WHEN prosecdef THEN 'MEDIUM RISK'
      ELSE 'LOW RISK'
    END as security_level,
    CASE 
      WHEN prosecdef AND NOT (proconfig @> ARRAY['search_path=public'])
        THEN 'CRITICAL: Add SET search_path = public to prevent search_path poisoning'
      WHEN prosecdef 
        THEN 'REVIEW: Verify function does not expose sensitive data or bypass RLS'
      ELSE 'OK: Function is not SECURITY DEFINER'
    END as recommendation
  FROM pg_proc 
  WHERE pronamespace = 'public'::regnamespace
    AND proname NOT LIKE 'pg_%'
  ORDER BY 
    CASE 
      WHEN prosecdef AND NOT (proconfig @> ARRAY['search_path=public']) THEN 1
      WHEN prosecdef THEN 2
      ELSE 3
    END;
END;
$$;

-- 3. Crear función para listar extensiones y su ubicación
CREATE OR REPLACE FUNCTION public.audit_extensions_location()
RETURNS TABLE(
  extension_name text,
  schema_name text,
  security_recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.extname::text as extension_name,
    n.nspname::text as schema_name,
    CASE 
      WHEN n.nspname = 'public' 
        THEN '⚠️ WARNING: Consider moving to extensions schema for better security isolation'
      ELSE '✅ OK: Extension is in a dedicated schema'
    END as security_recommendation
  FROM pg_extension e
  JOIN pg_namespace n ON e.extnamespace = n.oid
  WHERE e.extname NOT IN ('plpgsql')
  ORDER BY 
    CASE WHEN n.nspname = 'public' THEN 1 ELSE 2 END,
    e.extname;
END;
$$;

-- 4. Crear tabla para tracking de security reviews
CREATE TABLE IF NOT EXISTS public.security_review_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_type TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_name TEXT NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  review_status TEXT CHECK (review_status IN ('pending', 'approved', 'needs_action', 'fixed')),
  findings TEXT,
  recommendations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para security_review_log
ALTER TABLE public.security_review_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage security reviews"
ON public.security_review_log
FOR ALL
TO authenticated
USING (public.is_user_super_admin(auth.uid()))
WITH CHECK (public.is_user_super_admin(auth.uid()));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_security_review_log_status 
ON public.security_review_log(review_status);

CREATE INDEX IF NOT EXISTS idx_security_review_log_type 
ON public.security_review_log(review_type, object_type);

-- 5. Documentación de mejores prácticas
COMMENT ON TABLE public.security_review_log IS 
'SECURITY AUDIT LOG: Tracks security reviews of database objects, functions, and policies. Only accessible by super-admins.';

COMMENT ON FUNCTION public.audit_security_definer_objects() IS 
'SECURITY AUDIT: Lists all SECURITY DEFINER functions and their risk level. Use this to identify functions that need search_path protection.';

COMMENT ON FUNCTION public.audit_extensions_location() IS 
'SECURITY AUDIT: Lists all PostgreSQL extensions and recommends moving public schema extensions to dedicated extensions schema for better isolation.';