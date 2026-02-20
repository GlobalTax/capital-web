
-- Fix: Ampliar constraint responsable en mandato_checklist_tasks para incluir 'Equipo M&A'
-- Afecta 16 tareas del template sell-side (fases Due Diligence y Cierre)

-- 1. Eliminar constraint restrictivo antiguo
ALTER TABLE mandato_checklist_tasks
DROP CONSTRAINT IF EXISTS mandato_checklist_tasks_responsable_check;

-- 2. Crear constraint actualizado con 'Equipo M&A' y soporte IS NULL
ALTER TABLE mandato_checklist_tasks
ADD CONSTRAINT mandato_checklist_tasks_responsable_check
CHECK (
  responsable IS NULL OR
  responsable = ANY (ARRAY[
    'Dirección M&A',
    'Analista',
    'Asesor M&A',
    'Marketing',
    'Legal',
    'Research',
    'M&A Support',
    'Partner',
    'Analista Senior',
    'Equipo M&A'
  ])
);
