-- ===== HACER PÚBLICO EL BUCKET DOCUMENTS Y CONFIGURAR POLÍTICAS =====

-- 1. Hacer el bucket documents público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documents';

-- 2. Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can download public documents" ON storage.objects;

-- 3. Crear política: Admins pueden subir documentos
CREATE POLICY "Admins can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND current_user_is_admin()
);

-- 4. Crear política: Admins pueden actualizar documentos
CREATE POLICY "Admins can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND current_user_is_admin()
)
WITH CHECK (
  bucket_id = 'documents' 
  AND current_user_is_admin()
);

-- 5. Crear política: Admins pueden eliminar documentos
CREATE POLICY "Admins can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND current_user_is_admin()
);

-- 6. Crear política: Cualquiera puede descargar documentos públicos
CREATE POLICY "Anyone can download public documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');