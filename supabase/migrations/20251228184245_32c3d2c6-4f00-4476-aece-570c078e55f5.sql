-- Crear tabla workflow_task_templates para gestionar el workflow de Fase 0
CREATE TABLE public.workflow_task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  task_order INTEGER NOT NULL,
  task_category TEXT NOT NULL CHECK (task_category IN ('recepcion', 'valoracion', 'decision')),
  responsible_system TEXT NOT NULL CHECK (responsible_system IN ('Manual', 'Supabase', 'CRM', 'Brevo', 'ROD')),
  due_days_offset INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_automatable BOOLEAN DEFAULT false,
  description TEXT,
  lead_type TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.workflow_task_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage workflow templates"
ON public.workflow_task_templates FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Anyone can view active workflow templates"
ON public.workflow_task_templates FOR SELECT
USING (is_active = true);

-- Trigger para updated_at
CREATE TRIGGER update_workflow_task_templates_updated_at
BEFORE UPDATE ON public.workflow_task_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar las 21 tareas del workflow de Fase 0
INSERT INTO public.workflow_task_templates (task_name, task_order, task_category, responsible_system, due_days_offset, is_automatable, description) VALUES
('Verificar registro automático del lead con canal, subcanal y origen', 1, 'recepcion', 'Supabase', 0, true, 'Confirmar que el lead se registró correctamente con todos los datos de origen'),
('Asignar responsable (analista o asesor) según sector o territorio', 2, 'recepcion', 'CRM', 1, false, 'Asignar el lead al responsable adecuado'),
('Calificar lead: NEW → CONTACTED → QUALIFIED / DISQUALIFIED', 3, 'recepcion', 'CRM', 1, false, 'Actualizar el estado del lead según avance'),
('Documentar conversación inicial o Discovery Call', 4, 'recepcion', 'Manual', 2, false, 'Registrar notas de la primera conversación'),
('Confirmar consentimiento y trazabilidad GDPR (opt-in Brevo)', 5, 'recepcion', 'Brevo', 1, true, 'Verificar consentimiento para comunicaciones'),
('Enviar email de seguimiento personalizado', 6, 'recepcion', 'Brevo', 1, true, 'Email de seguimiento tras primer contacto'),
('Verificar calidad de datos y completitud del perfil', 7, 'recepcion', 'Manual', 1, false, 'Revisar que todos los campos estén completos'),
('Elaborar valoración inicial gratuita (múltiplos y comparables)', 8, 'valoracion', 'Manual', 3, false, 'Crear primera estimación de valor'),
('Elaborar análisis sectorial breve (contexto, operaciones, múltiplos)', 9, 'valoracion', 'Manual', 3, false, 'Preparar contexto del sector'),
('Crear ficha de morfología del lead (score interno 0–100)', 10, 'valoracion', 'Manual', 2, false, 'Calcular score de calidad del lead'),
('Revisar documentación mínima enviada (cuentas, plantilla, datos básicos)', 11, 'valoracion', 'Manual', 2, false, 'Verificar documentación recibida'),
('Subir entregables al registro del lead (PDF o enlace interno)', 12, 'valoracion', 'Supabase', 1, false, 'Adjuntar documentos al lead'),
('Investigar empresa en fuentes públicas (LinkedIn, web, prensa)', 13, 'valoracion', 'Manual', 2, false, 'Research de la empresa'),
('Preparar resumen ejecutivo para presentación interna', 14, 'valoracion', 'Manual', 3, false, 'Documento interno de resumen'),
('Evaluar morfología y clasificar lead (A/B/C según score)', 15, 'decision', 'Manual', 1, false, 'Clasificación final del lead'),
('Generar NDA inicial si procede (solo leads A ≥70)', 16, 'decision', 'Manual', 1, false, 'Preparar NDA para leads cualificados'),
('Programar reunión o llamada de valoración con cliente', 17, 'decision', 'Manual', 1, false, 'Agendar siguiente paso'),
('Subir caso a la Relación de Open Deals (ROD) si viable', 18, 'decision', 'ROD', 1, false, 'Registrar en sistema de deals'),
('Actualizar estado final del lead y transición a Fase 1 (Mandato)', 19, 'decision', 'CRM', 1, false, 'Cerrar Fase 0 y pasar a Mandato'),
('Documentar decisión final: Avanzar / Nurturing / Descartar', 20, 'decision', 'CRM', 1, false, 'Registrar decisión tomada'),
('Archivar documentación en sistema de gestión documental', 21, 'decision', 'Supabase', 1, false, 'Guardar documentación final');

-- Índices para rendimiento
CREATE INDEX idx_workflow_templates_category ON public.workflow_task_templates(task_category);
CREATE INDEX idx_workflow_templates_active ON public.workflow_task_templates(is_active);
CREATE INDEX idx_workflow_templates_order ON public.workflow_task_templates(task_order);