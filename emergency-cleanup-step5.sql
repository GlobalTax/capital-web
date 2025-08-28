-- =============================================
-- PASO 5: VERIFICAR RESULTADOS FINALES
-- =============================================

-- Ver tamaños actuales de tablas
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size_readable,
  pg_total_relation_size('public.' || tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC
LIMIT 10;

-- Contar registros restantes
SELECT 
  'workflow_executions' as tabla,
  COUNT(*) as registros_restantes
FROM public.workflow_executions
UNION ALL
SELECT 
  'tracking_events' as tabla,
  COUNT(*) as registros_restantes  
FROM public.tracking_events;