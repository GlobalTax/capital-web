-- Añadir campos para firma personalizada de asesor por valoración
ALTER TABLE professional_valuations 
ADD COLUMN IF NOT EXISTS advisor_role TEXT DEFAULT 'Consultor de M&A',
ADD COLUMN IF NOT EXISTS use_custom_advisor BOOLEAN DEFAULT false;