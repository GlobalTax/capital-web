-- =============================================
-- ELIMINACIÓN COMPLETA DEL SISTEMA DE VALORACIONES INCOMPLETAS
-- =============================================

-- 1. Eliminar triggers problemáticos
DROP TRIGGER IF EXISTS send_incomplete_valuation_alert_trigger ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_immediate_abandonment_alert ON public.company_valuations;

-- 2. Eliminar funciones de base de datos relacionadas
DROP FUNCTION IF EXISTS public.detect_abandoned_valuations();
DROP FUNCTION IF EXISTS public.detect_abandoned_valuations_emergency();
DROP FUNCTION IF EXISTS public.send_recovery_emails();
DROP FUNCTION IF EXISTS public.send_incomplete_valuation_alert();
DROP FUNCTION IF EXISTS public.trigger_immediate_abandonment_alert();
DROP FUNCTION IF EXISTS public.emergency_cleanup_daily();
DROP FUNCTION IF EXISTS public.comprehensive_cleanup_daily();

-- 3. Eliminar tabla completa de reportes diarios
DROP TABLE IF EXISTS public.daily_incomplete_reports;

-- 4. Eliminar columnas relacionadas con el sistema de valoraciones incompletas
ALTER TABLE public.company_valuations 
DROP COLUMN IF EXISTS abandonment_detected_at,
DROP COLUMN IF EXISTS recovery_link_sent,
DROP COLUMN IF EXISTS recovery_link_sent_at,
DROP COLUMN IF EXISTS immediate_alert_sent,
DROP COLUMN IF EXISTS immediate_alert_sent_at;

-- 5. Limpiar cualquier cron job relacionado (solo si existen)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'abandonment-detector-job') THEN
        PERFORM cron.unschedule('abandonment-detector-job');
    END IF;
    
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-incomplete-report-job') THEN
        PERFORM cron.unschedule('daily-incomplete-report-job');
    END IF;
END $$;