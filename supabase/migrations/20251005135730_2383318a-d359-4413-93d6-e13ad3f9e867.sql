-- ============================================
-- CREAR TAREAS RETROACTIVAMENTE PARA LEADS EXISTENTES
-- ============================================

-- Crear tareas para todos los leads de valoración que NO tienen tareas
DO $$
DECLARE
  valuation_record RECORD;
BEGIN
  -- Iterar sobre todas las valoraciones sin tareas
  FOR valuation_record IN 
    SELECT cv.id 
    FROM public.company_valuations cv
    LEFT JOIN public.lead_tasks lt ON lt.lead_id = cv.id AND lt.lead_type = 'valuation'
    WHERE lt.id IS NULL
  LOOP
    -- Crear las 21 tareas de Fase 0 para cada valoración
    INSERT INTO public.lead_tasks (lead_id, lead_type, task_name, task_order, task_category, responsible_system, status, is_system_task, due_date) VALUES
    -- RECEPCIÓN
    (valuation_record.id, 'valuation', 'Verificar registro automático del lead con canal, subcanal y origen', 1, 'recepcion', 'Supabase', 'pending', TRUE, NOW() + INTERVAL '1 day'),
    (valuation_record.id, 'valuation', 'Asignar responsable (analista o asesor) según sector o territorio', 2, 'recepcion', 'CRM', 'pending', TRUE, NOW() + INTERVAL '1 day'),
    (valuation_record.id, 'valuation', 'Calificar lead: NEW → CONTACTED → QUALIFIED / DISQUALIFIED', 3, 'recepcion', 'CRM', 'pending', TRUE, NOW() + INTERVAL '2 days'),
    (valuation_record.id, 'valuation', 'Documentar conversación inicial o Discovery Call', 4, 'recepcion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '3 days'),
    (valuation_record.id, 'valuation', 'Confirmar consentimiento y trazabilidad GDPR (opt-in Brevo)', 5, 'recepcion', 'Brevo', 'pending', TRUE, NOW() + INTERVAL '2 days'),
    
    -- VALORACIÓN
    (valuation_record.id, 'valuation', 'Elaborar valoración inicial gratuita (múltiplos y comparables)', 6, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '5 days'),
    (valuation_record.id, 'valuation', 'Elaborar análisis sectorial breve (contexto, operaciones, múltiplos)', 7, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '7 days'),
    (valuation_record.id, 'valuation', 'Crear ficha de morfología del lead (score interno 0–100)', 8, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '7 days'),
    (valuation_record.id, 'valuation', 'Revisar documentación mínima enviada (cuentas, plantilla, datos básicos)', 9, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '5 days'),
    (valuation_record.id, 'valuation', 'Subir entregables al registro del lead (PDF o enlace interno)', 10, 'valoracion', 'Supabase', 'pending', TRUE, NOW() + INTERVAL '8 days'),
    
    -- DECISIÓN
    (valuation_record.id, 'valuation', 'Evaluar morfología y clasificar lead (A/B/C según score)', 11, 'decision', 'Manual', 'pending', TRUE, NOW() + INTERVAL '8 days'),
    (valuation_record.id, 'valuation', 'Generar NDA inicial si procede (solo leads A ≥70)', 12, 'decision', 'Manual', 'pending', TRUE, NOW() + INTERVAL '9 days'),
    (valuation_record.id, 'valuation', 'Programar reunión o llamada de valoración con cliente', 13, 'decision', 'Manual', 'pending', TRUE, NOW() + INTERVAL '10 days'),
    (valuation_record.id, 'valuation', 'Subir caso a la Relación de Open Deals (ROD) si viable', 14, 'decision', 'ROD', 'pending', TRUE, NOW() + INTERVAL '12 days'),
    (valuation_record.id, 'valuation', 'Actualizar estado final del lead y transición a Fase 1 (Mandato)', 15, 'decision', 'CRM', 'pending', TRUE, NOW() + INTERVAL '14 days'),
    
    -- ADICIONALES
    (valuation_record.id, 'valuation', 'Enviar email de seguimiento personalizado', 16, 'recepcion', 'Brevo', 'pending', TRUE, NOW() + INTERVAL '4 days'),
    (valuation_record.id, 'valuation', 'Verificar calidad de datos y completitud del perfil', 17, 'recepcion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '3 days'),
    (valuation_record.id, 'valuation', 'Investigar empresa en fuentes públicas (LinkedIn, web, prensa)', 18, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '6 days'),
    (valuation_record.id, 'valuation', 'Preparar resumen ejecutivo para presentación interna', 19, 'valoracion', 'Manual', 'pending', TRUE, NOW() + INTERVAL '9 days'),
    (valuation_record.id, 'valuation', 'Documentar decisión final: Avanzar / Nurturing / Descartar', 20, 'decision', 'CRM', 'pending', TRUE, NOW() + INTERVAL '14 days'),
    (valuation_record.id, 'valuation', 'Archivar documentación en sistema de gestión documental', 21, 'decision', 'Supabase', 'pending', TRUE, NOW() + INTERVAL '15 days');
    
    RAISE LOG 'Tareas creadas para lead de valoración: %', valuation_record.id;
  END LOOP;
END $$;