-- ===== CREAR BUCKET DE STORAGE PARA DOCUMENTOS ROD =====

-- 1. Crear bucket público para ROD documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rod-documents',
  'rod-documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Admins pueden subir documentos ROD
CREATE POLICY "Admins can upload ROD documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rod-documents' 
  AND current_user_is_admin()
);

-- 3. Política: Admins pueden actualizar documentos ROD
CREATE POLICY "Admins can update ROD documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rod-documents' 
  AND current_user_is_admin()
)
WITH CHECK (
  bucket_id = 'rod-documents' 
  AND current_user_is_admin()
);

-- 4. Política: Admins pueden eliminar documentos ROD
CREATE POLICY "Admins can delete ROD documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'rod-documents' 
  AND current_user_is_admin()
);

-- 5. Política: Cualquiera puede descargar documentos ROD (son públicos)
CREATE POLICY "Anyone can download ROD documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'rod-documents');