-- ============================================
-- TABLA: lead_tasks
-- Sistema de seguimiento de tareas por lead
-- ============================================

CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('valuation', 'contact')),
  task_name TEXT NOT NULL,
  task_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  assigned_to UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  notes TEXT,
  is_system_task BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar queries
CREATE INDEX idx_lead_tasks_lead_id ON public.lead_tasks(lead_id);
CREATE INDEX idx_lead_tasks_status ON public.lead_tasks(status);
CREATE INDEX idx_lead_tasks_assigned_to ON public.lead_tasks(assigned_to);
CREATE INDEX idx_lead_tasks_due_date ON public.lead_tasks(due_date) WHERE status != 'completed';

-- Habilitar RLS
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo admins pueden gestionar tareas
CREATE POLICY "Admins can manage all lead tasks"
  ON public.lead_tasks
  FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- ============================================
-- FUNCIÓN: Crear tareas automáticas para nuevos leads
-- ============================================

CREATE OR REPLACE FUNCTION public.create_lead_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_names TEXT[] := ARRAY[
    'Acuse de recibo enviado',
    'Información básica recibida',
    'Discovery Call agendada',
    'Discovery Call realizada',
    'Documentación recibida',
    'Valoración inicial completada',
    'Análisis sectorial completado',
    'Ficha de morfología completada',
    'Lead cualificado/descartado',
    'Enviada propuesta de NDA + Mandato'
  ];
  i INTEGER;
BEGIN
  -- Crear las 10 tareas del sistema
  FOR i IN 1..10 LOOP
    INSERT INTO public.lead_tasks (
      lead_id,
      lead_type,
      task_name,
      task_order,
      status,
      is_system_task,
      due_date
    ) VALUES (
      NEW.id,
      TG_ARGV[0], -- 'valuation' o 'contact'
      task_names[i],
      i,
      'pending',
      TRUE,
      NOW() + (i * INTERVAL '2 days') -- Fechas escalonadas cada 2 días
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS: Crear tareas automáticamente
-- ============================================

-- Trigger para valoraciones (calculadora)
DROP TRIGGER IF EXISTS trigger_create_valuation_tasks ON public.company_valuations;
CREATE TRIGGER trigger_create_valuation_tasks
  AFTER INSERT ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_tasks('valuation');

-- Trigger para leads de contacto
DROP TRIGGER IF EXISTS trigger_create_contact_tasks ON public.contact_leads;
CREATE TRIGGER trigger_create_contact_tasks
  AFTER INSERT ON public.contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lead_tasks('contact');

-- ============================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.update_lead_task_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Si se marca como completada, registrar timestamp y usuario
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
    NEW.completed_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_lead_task_timestamp ON public.lead_tasks;
CREATE TRIGGER trigger_update_lead_task_timestamp
  BEFORE UPDATE ON public.lead_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_task_updated_at();