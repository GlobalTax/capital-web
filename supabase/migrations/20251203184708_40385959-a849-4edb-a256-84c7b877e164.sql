-- Fase 1: Añadir campo phone a email_recipients_config para cada asesor
ALTER TABLE email_recipients_config 
ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';

-- Fase 2: Añadir campo advisor_phone a professional_valuations para guardar el teléfono personalizado
ALTER TABLE professional_valuations 
ADD COLUMN IF NOT EXISTS advisor_phone TEXT DEFAULT '';