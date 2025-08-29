-- =============================================
-- DATA CLEANUP - PHASE 2 (without VACUUM)
-- Addressing 8+ GB disk usage - Historical data cleanup
-- =============================================

-- PASO 1: Limpiar datos antiguos de lead_behavior_events (28 MB actual)
-- Mantener solo los últimos 30 días de datos de comportamiento
DELETE FROM public.lead_behavior_events 
WHERE created_at < now() - INTERVAL '30 days';

-- PASO 2: Limpiar otras tablas con datos históricos acumulados
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

-- Eliminar conversiones publicitarias antiguas (más de 6 meses)
DELETE FROM public.ad_conversions 
WHERE created_at < now() - INTERVAL '6 months';

-- PASO 3: Crear función de limpieza automática mejorada
CREATE OR REPLACE FUNCTION public.comprehensive_cleanup_daily()
RETURNS TABLE(
  table_name text,
  records_deleted bigint,
  space_info text
) LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count bigint;
BEGIN
  -- Lead behavior events (30 días)
  DELETE FROM public.lead_behavior_events WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'lead_behavior_events'::text, deleted_count, 'Older than 30 days'::text;

  -- Tracking events (30 días)
  DELETE FROM public.tracking_events WHERE created_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'tracking_events'::text, deleted_count, 'Older than 30 days'::text;

  -- Blog analytics (90 días)
  DELETE FROM public.blog_analytics WHERE viewed_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'blog_analytics'::text, deleted_count, 'Older than 90 days'::text;

  -- Security events no críticos (60 días)
  DELETE FROM public.security_events 
  WHERE created_at < now() - INTERVAL '60 days'
  AND severity NOT IN ('critical', 'high');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'security_events'::text, deleted_count, 'Non-critical older than 60 days'::text;

  -- Rate limits (7 días)
  DELETE FROM public.rate_limits WHERE created_at < now() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'rate_limits'::text, deleted_count, 'Older than 7 days'::text;

  -- Workflow executions (mantener solo últimas 6 horas)
  DELETE FROM public.workflow_executions WHERE created_at < now() - INTERVAL '6 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'workflow_executions'::text, deleted_count, 'Older than 6 hours'::text;
    
  RAISE LOG 'Comprehensive cleanup completed. Tables processed: 6';
END;
$$;

-- PASO 4: Función para monitorear uso de disco
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
  
  -- Generar recomendaciones
  IF db_size > 100 * 1024 * 1024 THEN -- > 100 MB
    recommendations := array_append(recommendations, 'Database size exceeds 100MB - consider data archiving');
  END IF;
  
  RETURN QUERY SELECT 
    pg_size_pretty(db_size),
    large_tables,
    jsonb_build_object(
      'note', 'Storage buckets may contain large files - check Supabase Dashboard',
      'buckets', jsonb_build_array('case-studies-images', 'valuations', 'admin-videos'),
      'action', 'Review bucket contents for large PDFs, images, or videos'
    ),
    recommendations;
END;
$$;

-- PASO 5: Ejecutar limpieza inmediata
SELECT * FROM public.comprehensive_cleanup_daily();

-- PASO 6: Verificar estado actual
SELECT 
  'CLEANUP_SUMMARY' as status,
  pg_size_pretty(SUM(pg_total_relation_size('public.' || tablename))) as total_db_size,
  COUNT(*) as total_tables
FROM pg_tables 
WHERE schemaname = 'public';

-- PASO 7: Monitorear uso de disco
SELECT * FROM public.disk_usage_monitor();