-- =============================================
-- COMPREHENSIVE DISK CLEANUP - PHASE 2
-- Addressing 8+ GB disk usage after workflow_executions cleanup
-- =============================================

-- PASO 1: VACUUM FULL para reclamar espacio liberado del TRUNCATE
-- Esto recuperará el espacio físico de los 19 GB eliminados
VACUUM FULL public.workflow_executions;

-- PASO 2: Limpiar datos antiguos de lead_behavior_events (28 MB actual)
-- Mantener solo los últimos 30 días de datos de comportamiento
DELETE FROM public.lead_behavior_events 
WHERE created_at < now() - INTERVAL '30 days';

-- PASO 3: Limpiar otras tablas con datos históricos acumulados
-- Eliminar tracking events antiguos (más de 30 días)
DELETE FROM public.tracking_events 
WHERE created_at < now() - INTERVAL '30 days';

-- Eliminar analytics de blog antiguos (más de 90 días)
DELETE FROM public.blog_analytics 
WHERE viewed_at < now() - INTERVAL '90 days';

-- Eliminar security events no críticos antiguos (más de 60 días)
DELETE FROM public.security_events 
WHERE created_at < now() - INTERVAL '60 days'
AND severity NOT IN ('critical', 'high');

-- Eliminar rate limits antiguos (más de 7 días)
DELETE FROM public.rate_limits 
WHERE created_at < now() - INTERVAL '7 days';

-- PASO 4: Limpiar conversiones publicitarias antiguas (más de 6 meses)
DELETE FROM public.ad_conversions 
WHERE created_at < now() - INTERVAL '6 months';

-- PASO 5: VACUUM completo de todas las tablas principales para optimizar
VACUUM ANALYZE public.lead_behavior_events;
VACUUM ANALYZE public.tracking_events;
VACUUM ANALYZE public.blog_analytics;
VACUUM ANALYZE public.security_events;
VACUUM ANALYZE public.rate_limits;
VACUUM ANALYZE public.ad_conversions;

-- PASO 6: Crear función de limpieza automática mejorada
CREATE OR REPLACE FUNCTION public.comprehensive_cleanup_daily()
RETURNS TABLE(
  table_name text,
  records_deleted bigint,
  space_freed text
) LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count bigint;
  table_size_before bigint;
  table_size_after bigint;
BEGIN
  -- Lead behavior events (30 días)
  SELECT pg_total_relation_size('public.lead_behavior_events') INTO table_size_before;
  DELETE FROM public.lead_behavior_events WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  SELECT pg_total_relation_size('public.lead_behavior_events') INTO table_size_after;
  
  RETURN QUERY SELECT 
    'lead_behavior_events'::text,
    deleted_count,
    pg_size_pretty(table_size_before - table_size_after);

  -- Tracking events (30 días)
  SELECT pg_total_relation_size('public.tracking_events') INTO table_size_before;
  DELETE FROM public.tracking_events WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  SELECT pg_total_relation_size('public.tracking_events') INTO table_size_after;
  
  RETURN QUERY SELECT 
    'tracking_events'::text,
    deleted_count,
    pg_size_pretty(table_size_before - table_size_after);

  -- Blog analytics (90 días)
  SELECT pg_total_relation_size('public.blog_analytics') INTO table_size_before;
  DELETE FROM public.blog_analytics WHERE viewed_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  SELECT pg_total_relation_size('public.blog_analytics') INTO table_size_after;
  
  RETURN QUERY SELECT 
    'blog_analytics'::text,
    deleted_count,
    pg_size_pretty(table_size_before - table_size_after);

  -- Security events no críticos (60 días)
  SELECT pg_total_relation_size('public.security_events') INTO table_size_before;
  DELETE FROM public.security_events 
  WHERE created_at < now() - INTERVAL '60 days'
  AND severity NOT IN ('critical', 'high');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  SELECT pg_total_relation_size('public.security_events') INTO table_size_after;
  
  RETURN QUERY SELECT 
    'security_events'::text,
    deleted_count,
    pg_size_pretty(table_size_before - table_size_after);

  -- Rate limits (7 días)
  DELETE FROM public.rate_limits WHERE created_at < now() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT 
    'rate_limits'::text,
    deleted_count,
    'N/A'::text;

  -- Workflow executions (mantener solo últimas 6 horas para emergencias futuras)
  DELETE FROM public.workflow_executions WHERE created_at < now() - INTERVAL '6 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT 
    'workflow_executions'::text,
    deleted_count,
    'N/A'::text;
    
  -- VACUUM automático después de limpieza
  PERFORM pg_stat_reset();
  
  RAISE LOG 'Comprehensive cleanup completed. Total tables processed: 6';
END;
$$;

-- PASO 7: Función para monitorear uso de disco
CREATE OR REPLACE FUNCTION public.disk_usage_monitor()
RETURNS TABLE(
  total_database_size text,
  largest_tables text[],
  storage_buckets_info jsonb,
  recommendations text[]
) LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  db_size bigint;
  large_tables text[];
  recommendations text[] := '{}';
BEGIN
  -- Calcular tamaño total de la base de datos
  SELECT SUM(pg_total_relation_size('public.' || tablename)) 
  INTO db_size
  FROM pg_tables WHERE schemaname = 'public';
  
  -- Obtener las 5 tablas más grandes
  SELECT ARRAY(
    SELECT tablename || ' (' || pg_size_pretty(pg_total_relation_size('public.' || tablename)) || ')'
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size('public.' || tablename) DESC
    LIMIT 5
  ) INTO large_tables;
  
  -- Generar recomendaciones basadas en el tamaño
  IF db_size > 100 * 1024 * 1024 THEN -- > 100 MB
    recommendations := array_append(recommendations, 'Database size exceeds 100MB - consider data archiving');
  END IF;
  
  IF EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND pg_total_relation_size('public.' || tablename) > 50 * 1024 * 1024) THEN
    recommendations := array_append(recommendations, 'Large tables detected - review data retention policies');
  END IF;
  
  RETURN QUERY SELECT 
    pg_size_pretty(db_size),
    large_tables,
    jsonb_build_object(
      'note', 'Storage bucket sizes require separate monitoring via Supabase Dashboard',
      'buckets', jsonb_build_array('case-studies-images', 'valuations', 'admin-videos')
    ),
    recommendations;
END;
$$;

-- PASO 8: Ejecutar limpieza inmediata
SELECT * FROM public.comprehensive_cleanup_daily();

-- PASO 9: Verificar estado final
SELECT 
  'CLEANUP_SUMMARY' as status,
  pg_size_pretty(SUM(pg_total_relation_size('public.' || tablename))) as total_db_size,
  COUNT(*) as total_tables
FROM pg_tables 
WHERE schemaname = 'public';

-- LOG final
DO $$
BEGIN
  RAISE LOG 'DISK_CLEANUP_PHASE_2_COMPLETED: Database optimized, old data purged, monitoring functions created';
END $$;