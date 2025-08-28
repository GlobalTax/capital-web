-- =============================================
-- SCRIPT DE EMERGENCIA PARA REDUCIR USO CRÍTICO DE SUPABASE
-- EJECUTAR INMEDIATAMENTE EN SQL EDITOR DE SUPABASE
-- =============================================

-- PASO 1: LIMPIAR DATOS ANTIGUOS (LIBERAR ~19GB DE DISCO)
-- =============================================

-- Eliminar workflow executions antiguos (tabla más pesada - 19GB)
DELETE FROM public.workflow_executions 
WHERE created_at < now() - INTERVAL '7 days';

-- Eliminar tracking events antiguos (más de 30 días)
DELETE FROM public.tracking_events 
WHERE created_at < now() - INTERVAL '30 days';

-- Eliminar logs de seguridad antiguos (mantener solo eventos críticos)
DELETE FROM public.security_events 
WHERE created_at < now() - INTERVAL '30 days' 
AND severity NOT IN ('critical', 'high');

-- Eliminar analytics de blog antiguos (más de 90 días)
DELETE FROM public.blog_analytics 
WHERE viewed_at < now() - INTERVAL '90 days';

-- Eliminar rate limits antiguos (mantener solo último día)
DELETE FROM public.rate_limits 
WHERE created_at < now() - INTERVAL '1 day';

-- PASO 2: DESACTIVAR TRIGGERS PROBLEMÁTICOS (REDUCIR INVOCACIONES)
-- =============================================

-- Eliminar trigger que dispara edge functions masivamente en valoraciones
DROP TRIGGER IF EXISTS send_incomplete_valuation_alert_trigger ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_immediate_abandonment_alert ON public.company_valuations;

-- Eliminar triggers de automation workflows
DROP TRIGGER IF EXISTS trigger_automation_workflows_trigger ON public.lead_behavior_events;

-- PASO 3: OPTIMIZAR FUNCIÓN DE DETECCIÓN DE ABANDONO
-- =============================================
CREATE OR REPLACE FUNCTION public.detect_abandoned_valuations_emergency()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  abandoned_count INTEGER := 0;
BEGIN
  -- Marcar como abandonado SIN disparar edge functions
  UPDATE public.company_valuations 
  SET valuation_status = 'abandoned',
      abandonment_detected_at = now()
  WHERE valuation_status IN ('started', 'in_progress')
  AND last_activity_at < now() - INTERVAL '4 hours'  -- Aumentado de 8 minutos a 4 horas
  AND (abandonment_detected_at IS NULL OR abandonment_detected_at < now() - INTERVAL '48 hours')
  AND final_valuation IS NULL
  AND (
    COALESCE(completion_percentage, 0) < 30  -- Solo muy incompletos
    OR (revenue IS NULL AND ebitda IS NULL)
  );
  
  GET DIAGNOSTICS abandoned_count = ROW_COUNT;
  RETURN abandoned_count;
END;
$function$;

-- PASO 4: FUNCIÓN DE CLEANUP AUTOMÁTICO
-- =============================================
CREATE OR REPLACE FUNCTION public.emergency_cleanup_daily()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer := 0;
  temp_count integer;
BEGIN
  -- Limpiar workflow executions (mantener solo últimos 3 días)
  DELETE FROM public.workflow_executions 
  WHERE created_at < now() - INTERVAL '3 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- Limpiar tracking events antiguos
  DELETE FROM public.tracking_events 
  WHERE created_at < now() - INTERVAL '14 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- Limpiar logs antiguos
  DELETE FROM public.security_events 
  WHERE created_at < now() - INTERVAL '30 days'
  AND severity NOT IN ('critical', 'high');
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  RETURN deleted_count;
END;
$function$;

-- PASO 5: VERIFICAR ESPACIO LIBERADO
-- =============================================
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- PASO 6: EJECUTAR CLEANUP INMEDIATO
-- =============================================
SELECT public.emergency_cleanup_daily() as records_deleted;
SELECT public.detect_abandoned_valuations_emergency() as abandonments_marked;

-- =============================================
-- INSTRUCCIONES DE EJECUCIÓN:
-- 1. Copiar y pegar este script completo en Supabase SQL Editor
-- 2. Ejecutar todo el script de una vez
-- 3. Verificar resultados en la consulta de tamaños de tabla
-- 4. Esto debería liberar ~19GB y reducir invocaciones edge functions
-- =============================================