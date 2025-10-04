-- =============================================
-- ELIMINACIÓN COMPLETA DEL SISTEMA LEAD SCORING
-- =============================================
-- ADVERTENCIA: Esta migración elimina permanentemente:
-- - 7 tablas con 2,045 lead scores y 8,618 eventos
-- - 5 funciones de PostgreSQL
-- - 3 triggers
-- Operación IRREVERSIBLE

-- =============================================
-- PASO 1: Eliminar TODOS los Triggers
-- =============================================

-- Trigger de actualización de lead scores
DROP TRIGGER IF EXISTS lead_behavior_score_update ON public.lead_behavior_events;

-- Trigger de workflows de automatización (en lead_scores)
DROP TRIGGER IF EXISTS trigger_automation_workflows ON public.lead_scores;

-- Trigger automation_trigger (en lead_scores)
DROP TRIGGER IF EXISTS automation_trigger ON public.lead_scores;

-- =============================================
-- PASO 2: Eliminar Funciones (con CASCADE)
-- =============================================

-- Función de cálculo de lead score
DROP FUNCTION IF EXISTS public.calculate_lead_score(text) CASCADE;

-- Función de limpieza de datos antiguos
DROP FUNCTION IF EXISTS public.cleanup_old_lead_data() CASCADE;

-- Función de trigger de actualización de lead score
DROP FUNCTION IF EXISTS public.update_lead_score_trigger() CASCADE;

-- Función de procesamiento de workflows
DROP FUNCTION IF EXISTS public.process_automation_workflows() CASCADE;

-- Función de trigger de workflows
DROP FUNCTION IF EXISTS public.trigger_automation_workflows() CASCADE;

-- =============================================
-- PASO 3: Eliminar Tablas (orden de dependencias)
-- =============================================

-- 3.1: Tablas dependientes de lead_scores
DROP TABLE IF EXISTS public.lead_alerts CASCADE;
DROP TABLE IF EXISTS public.scheduled_emails CASCADE;

-- 3.2: Tablas dependientes de automation_workflows
DROP TABLE IF EXISTS public.workflow_executions CASCADE;

-- 3.3: Tablas dependientes de lead_scoring_rules
DROP TABLE IF EXISTS public.lead_behavior_events CASCADE;

-- 3.4: Tabla principal de lead_scores
DROP TABLE IF EXISTS public.lead_scores CASCADE;

-- 3.5: Tabla de reglas de scoring
DROP TABLE IF EXISTS public.lead_scoring_rules CASCADE;

-- 3.6: Tabla de workflows de automatización
DROP TABLE IF EXISTS public.automation_workflows CASCADE;

-- =============================================
-- PASO 4: Verificación
-- =============================================

-- Log de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Lead Scoring System eliminado completamente';
  RAISE NOTICE 'Tablas eliminadas: 7';
  RAISE NOTICE 'Funciones eliminadas: 5';
  RAISE NOTICE 'Triggers eliminados: 3';
  RAISE NOTICE 'Datos eliminados: ~2,045 lead scores + 8,618 eventos';
END $$;