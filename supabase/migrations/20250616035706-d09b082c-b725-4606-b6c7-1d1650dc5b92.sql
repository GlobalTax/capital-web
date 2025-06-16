
-- Crear bucket para almacenar imágenes de casos de éxito y operaciones
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-studies-images', 'case-studies-images', true);

-- Crear políticas para el bucket (muy permisivas para facilitar el uso)
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'case-studies-images');

CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'case-studies-images');

CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'case-studies-images');

CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'case-studies-images');

-- Agregar campos de imagen a la tabla case_studies
ALTER TABLE case_studies 
ADD COLUMN logo_url TEXT,
ADD COLUMN featured_image_url TEXT;

-- Agregar campos de imagen a la tabla company_operations
ALTER TABLE company_operations 
ADD COLUMN logo_url TEXT,
ADD COLUMN featured_image_url TEXT;
