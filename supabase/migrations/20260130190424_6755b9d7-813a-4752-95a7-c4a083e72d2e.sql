-- Añadir campo para marcar estados de etapa prospecto
ALTER TABLE public.contact_statuses 
ADD COLUMN IF NOT EXISTS is_prospect_stage BOOLEAN NOT NULL DEFAULT false;

-- Marcar los estados que corresponden a etapa prospecto (defaults iniciales)
UPDATE public.contact_statuses 
SET is_prospect_stage = true 
WHERE status_key IN ('reunion_programada', 'psh_enviada', 'video');

-- Comentario para documentar el propósito
COMMENT ON COLUMN public.contact_statuses.is_prospect_stage IS 'Indica si los leads en este estado deben aparecer en Gestión de Prospectos';