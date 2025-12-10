-- Hacer el bucket valuations público para permitir descarga de PDFs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'valuations';

-- Permitir lectura pública de los PDFs de valoración
CREATE POLICY "Public can read valuation PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'valuations');