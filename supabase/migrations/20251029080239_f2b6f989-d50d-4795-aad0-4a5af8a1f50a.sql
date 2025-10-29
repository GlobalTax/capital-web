-- FASE 8 - MIGRACIÓN 5: Proteger materialized view con RLS
-- Revocar acceso público y permitir solo a service_role

-- Revocar todos los permisos de anon y authenticated
REVOKE ALL ON public.banner_daily_analytics FROM anon, authenticated;

-- Solo permitir acceso a service_role (edge functions) y postgres
GRANT SELECT ON public.banner_daily_analytics TO service_role;

-- Comentario explicativo
COMMENT ON MATERIALIZED VIEW public.banner_daily_analytics IS 
'Analytics aggregation refreshed periodically. Access restricted to service role only for security (Phase 8).';