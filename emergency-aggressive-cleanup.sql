-- =============================================
-- EMERGENCY AGGRESSIVE CLEANUP - 21M RECORDS
-- ⚠️  CRITICAL: Execute one section at a time!
-- =============================================

-- OPCIÓN 1: LIMPIEZA TOTAL (MÁS RÁPIDA) - ⚠️ EJECUTAR INMEDIATAMENTE
-- Si los datos de workflow_executions NO son críticos
TRUNCATE public.workflow_executions;

-- OPCIÓN 2: LIMPIEZA POR TIEMPO (MÁS CONSERVADORA)
-- Ejecutar UNA de estas queries según tus necesidades:

-- A) Eliminar TODO > 3 días (más conservador)
-- DELETE FROM public.workflow_executions 
-- WHERE created_at < now() - INTERVAL '3 days';

-- B) Eliminar TODO > 1 día (agresivo)
-- DELETE FROM public.workflow_executions 
-- WHERE created_at < now() - INTERVAL '1 day';

-- C) Eliminar TODO > 12 horas (muy agresivo)
-- DELETE FROM public.workflow_executions 
-- WHERE created_at < now() - INTERVAL '12 hours';

-- D) Mantener solo las últimas 6 horas
DELETE FROM public.workflow_executions 
WHERE created_at < now() - INTERVAL '6 hours';

-- =============================================
-- VERIFICACIÓN RÁPIDA DESPUÉS DEL CLEANUP
-- =============================================

-- Ver solo el tamaño de workflow_executions
SELECT 
  'workflow_executions' as tabla,
  pg_size_pretty(pg_total_relation_size('public.workflow_executions')) as size_readable,
  pg_total_relation_size('public.workflow_executions') as size_bytes
FROM pg_tables 
WHERE tablename = 'workflow_executions';

-- Contar registros restantes (más rápido que COUNT(*))
SELECT 
  'workflow_executions' as tabla,
  reltuples::bigint as registros_estimados
FROM pg_class 
WHERE relname = 'workflow_executions';