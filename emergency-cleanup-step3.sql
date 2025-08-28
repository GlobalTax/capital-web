-- =============================================
-- PASO 3: LOTE FINAL WORKFLOW EXECUTIONS
-- =============================================

-- LOTE 3: Eliminar workflow executions (>7 días)
DELETE FROM public.workflow_executions 
WHERE created_at < now() - INTERVAL '7 days'
LIMIT 15000;