-- =============================================
-- VACUUM CLEANUP - MANUAL EXECUTION REQUIRED
-- Execute this OUTSIDE of migration transactions
-- =============================================

-- CRÍTICO: Ejecutar cada comando por separado en SQL Editor
-- NO ejecutar todo junto en una transacción

-- PASO 1: VACUUM FULL para reclamar espacio del TRUNCATE (19 GB)
VACUUM FULL public.workflow_executions;

-- PASO 2: VACUUM ANALYZE para optimizar estadísticas
VACUUM ANALYZE public.lead_behavior_events;
VACUUM ANALYZE public.tracking_events;
VACUUM ANALYZE public.blog_analytics;
VACUUM ANALYZE public.security_events;
VACUUM ANALYZE public.rate_limits;
VACUUM ANALYZE public.ad_conversions;

-- PASO 3: REINDEX para optimizar índices
REINDEX TABLE public.lead_behavior_events;
REINDEX TABLE public.company_valuations;
REINDEX TABLE public.security_events;

-- PASO 4: Verificar espacio reclamado
SELECT 
  'POST_VACUUM_STATUS' as status,
  pg_size_pretty(SUM(pg_total_relation_size('public.' || tablename))) as total_db_size,
  COUNT(*) as total_tables,
  pg_size_pretty(pg_database_size(current_database())) as full_database_size
FROM pg_tables 
WHERE schemaname = 'public';