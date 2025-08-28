-- =============================================
-- PASO 4: LIMPIAR OTRAS TABLAS + DESACTIVAR TRIGGERS
-- =============================================

-- Eliminar tracking events antiguos
DELETE FROM public.tracking_events 
WHERE created_at < now() - INTERVAL '30 days'
LIMIT 5000;

-- Eliminar security events antiguos
DELETE FROM public.security_events 
WHERE created_at < now() - INTERVAL '30 days' 
AND severity NOT IN ('critical', 'high')
LIMIT 5000;

-- CRÍTICO: Desactivar triggers problemáticos
DROP TRIGGER IF EXISTS send_incomplete_valuation_alert_trigger ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_immediate_abandonment_alert ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_automation_workflows_trigger ON public.lead_behavior_events;