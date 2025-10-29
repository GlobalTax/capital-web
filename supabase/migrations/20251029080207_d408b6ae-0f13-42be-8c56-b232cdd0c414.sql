-- FASE 8 - MIGRACIÓN 3: Convertir vista SECURITY DEFINER a función segura
-- Eliminar admin_security_alerts vista y crear función con validación explícita de permisos

-- Eliminar vista actual
DROP VIEW IF EXISTS public.admin_security_alerts;

-- Crear función segura en su lugar
CREATE OR REPLACE FUNCTION public.get_admin_security_alerts()
RETURNS TABLE(
  alert_type text,
  id uuid,
  email text,
  company_name text,
  unique_token varchar,
  token_used_at timestamptz,
  token_expires_at timestamptz,
  created_at timestamptz,
  alert_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo super admins y service role pueden ver alertas de seguridad
  IF NOT (is_user_super_admin(auth.uid()) OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required for security alerts';
  END IF;

  RETURN QUERY
  SELECT 
    'valuation_token_abuse'::text,
    v.id,
    v.email,
    v.company_name,
    v.unique_token,
    v.token_used_at,
    v.token_expires_at,
    v.created_at,
    CASE 
      WHEN v.token_used_at IS NOT NULL AND v.token_expires_at > NOW() 
        THEN 'Token usado antes de expirar (posible acceso legítimo)'::text
      WHEN v.token_expires_at < NOW() AND v.token_used_at IS NULL
        THEN 'Token expirado sin uso (posible intento fallido)'::text
      ELSE 'Normal'::text
    END
  FROM company_valuations v
  WHERE (v.is_deleted = false OR v.is_deleted IS NULL)
    AND v.valuation_status = 'completed'

  UNION ALL

  SELECT
    'contact_lead_spam'::text,
    cl.id,
    cl.email,
    cl.company,
    NULL::varchar,
    NULL::timestamptz,
    NULL::timestamptz,
    cl.created_at,
    'Múltiples leads del mismo email en 7 días'::text
  FROM contact_leads cl
  WHERE (cl.is_deleted = false OR cl.is_deleted IS NULL)
    AND cl.email IN (
      SELECT email 
      FROM contact_leads 
      WHERE created_at > NOW() - INTERVAL '7 days'
        AND (is_deleted = false OR is_deleted IS NULL)
      GROUP BY email 
      HAVING COUNT(*) > 3
    );
END;
$$;

COMMENT ON FUNCTION public.get_admin_security_alerts() IS 
'SECURITY: Converted from SECURITY DEFINER view to function with explicit permission validation. Only super admins and service role can access security alerts (Phase 8).';