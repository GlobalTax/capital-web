-- =============================================
-- PASO 1: ELIMINAR DATOS ANTIGUOS EN LOTES PEQUEÑOS
-- EJECUTAR UNO POR UNO PARA EVITAR TIMEOUT
-- =============================================

-- LOTE 1: Eliminar workflow executions MÁS ANTIGUOS (>30 días)
DELETE FROM public.workflow_executions 
WHERE created_at < now() - INTERVAL '30 days'
LIMIT 10000;