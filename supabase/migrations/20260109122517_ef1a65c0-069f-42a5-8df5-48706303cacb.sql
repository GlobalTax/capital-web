-- 1. Poblar name_en para todos los sectores existentes
UPDATE sectors SET name_en = 'Technology' WHERE slug = 'tecnologia';
UPDATE sectors SET name_en = 'Financial Services' WHERE slug = 'servicios-financieros';
UPDATE sectors SET name_en = 'Health & Biotechnology' WHERE slug = 'salud-biotecnologia';
UPDATE sectors SET name_en = 'Industrial & Manufacturing' WHERE slug = 'industrial-manufacturero';
UPDATE sectors SET name_en = 'Professional Advisory' WHERE slug = 'asesorias-profesionales';
UPDATE sectors SET name_en = 'Retail & Consumer' WHERE slug = 'retail-consumo';
UPDATE sectors SET name_en = 'Education' WHERE slug = 'educacion';
UPDATE sectors SET name_en = 'Energy & Renewables' WHERE slug = 'energia-renovables';
UPDATE sectors SET name_en = 'Real Estate' WHERE slug = 'inmobiliario';
UPDATE sectors SET name_en = 'Food & Beverages' WHERE slug = 'alimentacion-bebidas';
UPDATE sectors SET name_en = 'Automotive' WHERE slug = 'automocion';
UPDATE sectors SET name_en = 'Logistics & Transportation' WHERE slug = 'logistica-transporte';
UPDATE sectors SET name_en = 'Telecommunications' WHERE slug = 'telecomunicaciones';
UPDATE sectors SET name_en = 'Media & Entertainment' WHERE slug = 'medios-entretenimiento';
UPDATE sectors SET name_en = 'Tourism & Hospitality' WHERE slug = 'turismo-hosteleria';
UPDATE sectors SET name_en = 'Construction' WHERE slug = 'construccion';
UPDATE sectors SET name_en = 'Pharmaceutical' WHERE slug = 'farmaceutico';
UPDATE sectors SET name_en = 'Textile & Fashion' WHERE slug = 'textil-moda';
UPDATE sectors SET name_en = 'Chemical' WHERE slug = 'quimico';
UPDATE sectors SET name_en = 'Agriculture' WHERE slug = 'agricultura';
UPDATE sectors SET name_en = 'Other' WHERE slug = 'otros';

-- 2. Añadir campos de traducción a company_operations (si no existen)
ALTER TABLE company_operations 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_ca TEXT,
ADD COLUMN IF NOT EXISTS short_description_en TEXT,
ADD COLUMN IF NOT EXISTS short_description_ca TEXT;

-- 3. Comentarios
COMMENT ON COLUMN company_operations.description_en IS 'Descripción en inglés (manual o auto-generada)';
COMMENT ON COLUMN company_operations.description_ca IS 'Descripción en catalán (manual o auto-generada)';
COMMENT ON COLUMN company_operations.short_description_en IS 'Descripción corta en inglés';
COMMENT ON COLUMN company_operations.short_description_ca IS 'Descripción corta en catalán';