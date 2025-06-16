
-- Agregar campo de ubicaciones a la tabla case_studies
ALTER TABLE case_studies 
ADD COLUMN display_locations TEXT[] DEFAULT ARRAY['home', 'casos-exito'];

-- Agregar campo de ubicaciones a la tabla company_operations
ALTER TABLE company_operations 
ADD COLUMN display_locations TEXT[] DEFAULT ARRAY['home', 'operaciones'];

-- Agregar campo de ubicaciones a la tabla key_statistics
ALTER TABLE key_statistics 
ADD COLUMN display_locations TEXT[] DEFAULT ARRAY['home', 'market-insights'];

-- Agregar campo de ubicaciones a la tabla sector_valuation_multiples
ALTER TABLE sector_valuation_multiples 
ADD COLUMN display_locations TEXT[] DEFAULT ARRAY['home', 'multiplos'];

-- Agregar campo de ubicaciones a la tabla testimonials
ALTER TABLE testimonials 
ADD COLUMN display_locations TEXT[] DEFAULT ARRAY['home', 'testimonios'];

-- Crear comentarios para documentar las ubicaciones disponibles
COMMENT ON COLUMN case_studies.display_locations IS 'Páginas donde se muestra: home, casos-exito, nosotros, venta-empresas, compra-empresas, etc.';
COMMENT ON COLUMN company_operations.display_locations IS 'Páginas donde se muestra: home, operaciones, venta-empresas, compra-empresas, etc.';
COMMENT ON COLUMN key_statistics.display_locations IS 'Páginas donde se muestra: home, market-insights, nosotros, etc.';
COMMENT ON COLUMN sector_valuation_multiples.display_locations IS 'Páginas donde se muestra: home, multiplos, calculadora-valoracion, etc.';
COMMENT ON COLUMN testimonials.display_locations IS 'Páginas donde se muestra: home, testimonios, nosotros, etc.';
