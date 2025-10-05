-- ============================================
-- MIGRACIÓN: Sistema de Tareas Fase 0 (21 tareas específicas)
-- ============================================

-- 1. Añadir nuevos campos a lead_tasks
ALTER TABLE public.lead_tasks 
ADD COLUMN IF NOT EXISTS task_category TEXT CHECK (task_category IN ('recepcion', 'valoracion', 'decision')),
ADD COLUMN IF NOT EXISTS responsible_system TEXT,
ADD COLUMN IF NOT EXISTS deliverable_url TEXT,
ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT FALSE;

-- 2. Actualizar índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_lead_tasks_category ON public.lead_tasks(task_category);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_responsible ON public.lead_tasks(responsible_system);

-- 3. Reemplazar función create_lead_tasks con las 21 tareas específicas de Fase 0
DROP FUNCTION IF EXISTS public.create_lead_tasks() CASCADE;

CREATE OR REPLACE FUNCTION public.create_lead_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo crear tareas para leads de tipo 'valuation'
  IF TG_ARGV[0] = 'valuation' THEN
    
    -- ===== RECEPCIÓN Y CLASIFICACIÓN DE LEADS (Tareas 1-6) =====
    INSERT INTO public.lead_tasks (lead_id, lead_type, task_name, task_order, task_category, responsible_system, status, is_system_task, due_date) VALUES
    (NEW.id, 'valuation', 'Verificar registro automático del lead con canal, subcanal y origen', 1, 'recepcion', 'Supabase', 'pending', TRUE, NOW() + INTERVAL '1 day'),
    (NEW.id, 'valuation', 'Asignar responsable (analista o asesor) según sector o territorio', 2, 'recepcion', 'CRM', 'pending', TRUE, NOW() + INTERVAL '1 day'),
    (NEW.id, 'valuation', 'Calificar lead: NEW → CONTACTED → QUALIFIED / DISQUALIFIED', 3, 'recepcion', 'CRM', 'pending', TRUE, NOW() + INTERVAL '2 days'),
    (NEW.id, 'valuation', 'Documentar conversación inicial o Discovery Call', 4, 'recepcion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '3 days'),
    (NEW.id, 'valuation', 'Confirmar consentimiento y trazabilidad GDPR (opt-in Brevo)', 5, 'recepcion', 'Brevo', 'pending', TRUE, NOW() + INTERVAL '2 days'),
    
    -- ===== VALORACIÓN Y ANÁLISIS (Tareas 6-11) =====
    (NEW.id, 'valuation', 'Elaborar valoración inicial gratuita (múltiplos y comparables)', 6, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '5 days'),
    (NEW.id, 'valuation', 'Elaborar análisis sectorial breve (contexto, operaciones, múltiplos)', 7, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '7 days'),
    (NEW.id, 'valuation', 'Crear ficha de morfología del lead (score interno 0–100)', 8, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '7 days'),
    (NEW.id, 'valuation', 'Revisar documentación mínima enviada (cuentas, plantilla, datos básicos)', 9, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '5 days'),
    (NEW.id, 'valuation', 'Subir entregables al registro del lead (PDF o enlace interno)', 10, 'valoracion', 'Supabase', 'pending', TRUE, NOW() + INTERVAL '8 days'),
    
    -- ===== DECISIÓN INTERNA Y SEGUIMIENTO (Tareas 12-21) =====
    (NEW.id, 'valuation', 'Evaluar morfología y clasificar lead (A/B/C según score)', 11, 'decision', 'Manual', 'pending', TRUE, NOW() + INTERVAL '8 days'),
    (NEW.id, 'valuation', 'Generar NDA inicial si procede (solo leads A ≥70)', 12, 'decision', 'Manual', 'pending', TRUE, NOW() + INTERVAL '9 days'),
    (NEW.id, 'valuation', 'Programar reunión o llamada de valoración con cliente', 13, 'decision', 'Manual', 'pending', TRUE, NOW() + INTERVAL '10 days'),
    (NEW.id, 'valuation', 'Subir caso a la Relación de Open Deals (ROD) si viable', 14, 'decision', 'ROD', 'pending', TRUE, NOW() + INTERVAL '12 days'),
    (NEW.id, 'valuation', 'Actualizar estado final del lead y transición a Fase 1 (Mandato)', 15, 'decision', 'CRM', 'pending', TRUE, NOW() + INTERVAL '14 days'),
    
    -- ===== TAREAS ADICIONALES OPCIONALES (16-21) =====
    (NEW.id, 'valuation', 'Enviar email de seguimiento personalizado', 16, 'recepcion', 'Brevo', 'pending', TRUE, NOW() + INTERVAL '4 days'),
    (NEW.id, 'valuation', 'Verificar calidad de datos y completitud del perfil', 17, 'recepcion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '3 days'),
    (NEW.id, 'valuation', 'Investigar empresa en fuentes públicas (LinkedIn, web, prensa)', 18, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '6 days'),
    (NEW.id, 'valuation', 'Preparar resumen ejecutivo para presentación interna', 19, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '9 days'),
    (NEW.id, 'valuation', 'Documentar decisión final: Avanzar / Nurturing / Descartar', 20, 'decision', 'CRM', 'pending', TRUE, NOW() + INTERVAL '14 days'),
    (NEW.id, 'valuation', 'Archivar documentación en sistema de gestión documental', 21, 'decision', 'Supabase', 'pending', TRUE, NOW() + INTERVAL '15 days');
    
  ELSE
    -- Para otros tipos de leads (contact, collaborator), crear tareas básicas
    INSERT INTO public.lead_tasks (lead_id, lead_type, task_name, task_order, task_category, responsible_system, status, is_system_task, due_date) VALUES
    (NEW.id, TG_ARGV[0], 'Acuse de recibo enviado', 1, 'recepcion', 'Brevo', 'pending', TRUE, NOW() + INTERVAL '1 day'),
    (NEW.id, TG_ARGV[0], 'Lead asignado a responsable', 2, 'recepcion', 'CRM', 'pending', TRUE, NOW() + INTERVAL '1 day'),
    (NEW.id, TG_ARGV[0], 'Primera llamada o reunión realizada', 3, 'recepcion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '3 days'),
    (NEW.id, TG_ARGV[0], 'Documentación básica recibida', 4, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '5 days'),
    (NEW.id, TG_ARGV[0], 'Lead cualificado o descartado', 5, 'decision', 'CRM', 'pending', TRUE, NOW() + INTERVAL '7 days');
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Recrear triggers para aplicar la nueva función
DROP TRIGGER IF EXISTS create_valuation_tasks ON public.company_valuations;
DROP TRIGGER IF EXISTS create_contact_tasks ON public.contact_leads;
DROP TRIGGER IF EXISTS create_collaborator_tasks ON public.collaborator_applications;

CREATE TRIGGER create_valuation_tasks
  AFTER INSERT ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_tasks('valuation');

CREATE TRIGGER create_contact_tasks
  AFTER INSERT ON public.contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_tasks('contact');

CREATE TRIGGER create_collaborator_tasks
  AFTER INSERT ON public.collaborator_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_tasks('collaborator');

-- 5. Crear función para transición automática a 'calificado' cuando se completan las 21 tareas
CREATE OR REPLACE FUNCTION public.auto_qualify_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
BEGIN
  -- Solo aplicar para tareas de valoración
  IF NEW.lead_type = 'valuation' AND NEW.status = 'completed' THEN
    
    -- Contar tareas totales y completadas
    SELECT COUNT(*) INTO total_tasks
    FROM public.lead_tasks
    WHERE lead_id = NEW.lead_id AND lead_type = 'valuation';
    
    SELECT COUNT(*) INTO completed_tasks
    FROM public.lead_tasks
    WHERE lead_id = NEW.lead_id 
      AND lead_type = 'valuation' 
      AND status = 'completed';
    
    -- Si todas las tareas están completadas, actualizar estado a 'calificado'
    IF completed_tasks = total_tasks AND total_tasks >= 21 THEN
      UPDATE public.company_valuations
      SET 
        lead_status_crm = 'calificado',
        status_updated_at = NOW()
      WHERE id = NEW.lead_id;
      
      -- Log de seguridad
      RAISE LOG 'Lead % auto-calificado tras completar 21 tareas de Fase 0', NEW.lead_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Crear trigger para auto-calificación
DROP TRIGGER IF EXISTS trigger_auto_qualify_lead ON public.lead_tasks;

CREATE TRIGGER trigger_auto_qualify_lead
  AFTER UPDATE ON public.lead_tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.auto_qualify_lead();

-- 7. Comentarios para documentación
COMMENT ON COLUMN public.lead_tasks.task_category IS 'Categoría de la tarea: recepcion, valoracion, decision';
COMMENT ON COLUMN public.lead_tasks.responsible_system IS 'Sistema responsable: Brevo, Supabase, CRM, ROD, Manual';
COMMENT ON COLUMN public.lead_tasks.deliverable_url IS 'URL del entregable generado (PDF, documento, etc)';
COMMENT ON COLUMN public.lead_tasks.is_automated IS 'Indica si la tarea puede automatizarse';
COMMENT ON FUNCTION public.auto_qualify_lead() IS 'Auto-califica leads de valoración cuando completan las 21 tareas de Fase 0';