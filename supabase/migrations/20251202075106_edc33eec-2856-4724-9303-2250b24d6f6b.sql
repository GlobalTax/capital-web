-- Crear políticas de Storage RLS para el bucket valuations
-- Permitir a admins autenticados subir archivos al bucket valuations

-- Política INSERT para permitir a admins subir archivos
CREATE POLICY "Admins can upload valuations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'valuations'
  AND public.current_user_is_admin()
);

-- Política UPDATE para permitir a admins actualizar archivos (upsert)
CREATE POLICY "Admins can update valuations"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'valuations'
  AND public.current_user_is_admin()
)
WITH CHECK (
  bucket_id = 'valuations'
  AND public.current_user_is_admin()
);

-- Política DELETE para permitir a admins eliminar archivos
CREATE POLICY "Admins can delete valuations"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'valuations'
  AND public.current_user_is_admin()
);