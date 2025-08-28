-- =============================================
-- PASO 2: CONTINUAR ELIMINANDO WORKFLOW EXECUTIONS
-- =============================================

-- LOTE 2: Eliminar workflow executions (>14 días)
DELETE FROM public.workflow_executions 
WHERE created_at < now() - INTERVAL '14 days'
LIMIT 10000;