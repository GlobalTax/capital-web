-- Añadir campos de traducción para highlights
ALTER TABLE public.company_operations 
ADD COLUMN IF NOT EXISTS highlights_en TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS highlights_ca TEXT[] DEFAULT NULL;

-- Comentarios descriptivos
COMMENT ON COLUMN public.company_operations.highlights_en IS 'Highlights traducidos al inglés';
COMMENT ON COLUMN public.company_operations.highlights_ca IS 'Highlights traducidos al catalán';