-- =============================================
-- ELIMINACIÓN COMPLETA DEL SISTEMA DE VALORACIONES INCOMPLETAS
-- =============================================

-- 1. Eliminar TODOS los triggers relacionados primero
DROP TRIGGER IF EXISTS send_incomplete_valuation_alert_trigger ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_immediate_abandonment_alert ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_incomplete_valuation_alert ON public.company_valuations;

-- 2. Eliminar funciones de base de datos relacionadas (ahora sin dependencias)
DROP FUNCTION IF EXISTS public.detect_abandoned_valuations() CASCADE;
DROP FUNCTION IF EXISTS public.detect_abandoned_valuations_emergency() CASCADE;
DROP FUNCTION IF EXISTS public.send_recovery_emails() CASCADE;
DROP FUNCTION IF EXISTS public.send_incomplete_valuation_alert() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_immediate_abandonment_alert() CASCADE;
DROP FUNCTION IF EXISTS public.emergency_cleanup_daily() CASCADE;
DROP FUNCTION IF EXISTS public.comprehensive_cleanup_daily() CASCADE;

-- 3. Eliminar tabla completa de reportes diarios
DROP TABLE IF EXISTS public.daily_incomplete_reports CASCADE;

-- 4. Eliminar columnas relacionadas con el sistema de valoraciones incompletas
ALTER TABLE public.company_valuations 
DROP COLUMN IF EXISTS abandonment_detected_at,
DROP COLUMN IF EXISTS recovery_link_sent,
DROP COLUMN IF EXISTS recovery_link_sent_at,
DROP COLUMN IF EXISTS immediate_alert_sent,
DROP COLUMN IF EXISTS immediate_alert_sent_at;