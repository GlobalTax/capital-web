-- Añadir columnas para sistema de comparables basado en texto libre
ALTER TABLE professional_valuations 
ADD COLUMN IF NOT EXISTS comparables_raw_text TEXT,
ADD COLUMN IF NOT EXISTS comparables_formatted_text TEXT,
ADD COLUMN IF NOT EXISTS include_comparables BOOLEAN DEFAULT false;

-- Comentarios descriptivos
COMMENT ON COLUMN professional_valuations.comparables_raw_text IS 'Texto libre con información de operaciones M&A pegado por el usuario';
COMMENT ON COLUMN professional_valuations.comparables_formatted_text IS 'Texto profesionalizado por IA para incluir en el PDF';
COMMENT ON COLUMN professional_valuations.include_comparables IS 'Toggle para mostrar/ocultar sección de comparables en el PDF';