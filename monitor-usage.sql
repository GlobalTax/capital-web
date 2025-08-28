-- =============================================
-- SCRIPT DE MONITOREO DE USO DE SUPABASE
-- EJECUTAR PARA VERIFICAR PROGRESO DEL CLEANUP
-- =============================================

-- VERIFICAR TAMAÑOS DE TABLAS (PRINCIPAL MÉTRICA)
-- =============================================
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size_readable,
  pg_total_relation_size('public.' || tablename) as size_bytes,
  ROUND(
    pg_total_relation_size('public.' || tablename) * 100.0 / 
    (SELECT SUM(pg_total_relation_size('public.' || t.tablename)) 
     FROM pg_tables t WHERE t.schemaname = 'public'), 2
  ) as percentage_of_total
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC
LIMIT 15;

-- VERIFICAR REGISTROS POR TABLA
-- =============================================
SELECT 
  'workflow_executions' as tabla,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') as ultimos_7_dias,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 day') as ultimo_dia
FROM public.workflow_executions
UNION ALL
SELECT 
  'tracking_events' as tabla,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') as ultimos_7_dias,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 day') as ultimo_dia
FROM public.tracking_events
UNION ALL
SELECT 
  'security_events' as tabla,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') as ultimos_7_dias,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 day') as ultimo_dia
FROM public.security_events
UNION ALL
SELECT 
  'company_valuations' as tabla,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') as ultimos_7_dias,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 day') as ultimo_dia
FROM public.company_valuations;

-- VERIFICAR TRIGGERS ACTIVOS (DEBEN ESTAR DESACTIVADOS)
-- =============================================
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (
  trigger_name LIKE '%incomplete%' OR
  trigger_name LIKE '%abandonment%' OR
  trigger_name LIKE '%automation%'
)
ORDER BY trigger_name;

-- ALERTAS DE DATOS ANTIGUOS
-- =============================================
SELECT 
  'workflow_executions' as tabla,
  COUNT(*) as registros_antiguos,
  'Más de 3 días' as descripcion
FROM public.workflow_executions 
WHERE created_at < now() - INTERVAL '3 days'
HAVING COUNT(*) > 0
UNION ALL
SELECT 
  'tracking_events' as tabla,
  COUNT(*) as registros_antiguos,
  'Más de 14 días' as descripcion
FROM public.tracking_events 
WHERE created_at < now() - INTERVAL '14 days'
HAVING COUNT(*) > 0
UNION ALL
SELECT 
  'security_events' as tabla,
  COUNT(*) as registros_antiguos,
  'Más de 30 días (no críticos)' as descripcion
FROM public.security_events 
WHERE created_at < now() - INTERVAL '30 days'
AND severity NOT IN ('critical', 'high')
HAVING COUNT(*) > 0;

-- ESTADÍSTICAS DE VALORACIONES (para monitorear actividad)
-- =============================================
SELECT 
  valuation_status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE abandonment_detected_at IS NOT NULL) as with_abandonment,
  COUNT(*) FILTER (WHERE immediate_alert_sent = true) as with_immediate_alert,
  COUNT(*) FILTER (WHERE recovery_link_sent = true) as with_recovery
FROM public.company_valuations
GROUP BY valuation_status
ORDER BY total DESC;

-- RESUMEN EJECUTIVO
-- =============================================
WITH total_size AS (
  SELECT SUM(pg_total_relation_size('public.' || tablename)) as bytes
  FROM pg_tables WHERE schemaname = 'public'
),
gb_calculation AS (
  SELECT 
    bytes,
    ROUND(bytes::numeric / (1024^3), 2) as gb,
    CASE 
      WHEN bytes > 2000 * 1024^3 THEN 'CRÍTICO: Excede 2TB'
      WHEN bytes > 1500 * 1024^3 THEN 'ALTO: Cerca del límite'  
      WHEN bytes > 1000 * 1024^3 THEN 'MEDIO: Monitorear'
      ELSE 'NORMAL: Dentro de límites'
    END as status
  FROM total_size
)
SELECT 
  gb || ' GB' as uso_total_disco,
  status as estado_uso,
  CASE 
    WHEN gb > 2000 THEN 'Ejecutar cleanup inmediato'
    WHEN gb > 1500 THEN 'Programar cleanup regular'
    ELSE 'Continuar monitoreo'
  END as accion_recomendada
FROM gb_calculation;

-- =============================================
-- EJECUTAR ESTE SCRIPT CADA HORA PARA MONITOREAR
-- GUARDARLO COMO BOOKMARK EN SUPABASE SQL EDITOR
-- =============================================