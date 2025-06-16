
-- Crear bucket de almacenamiento para las imágenes si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-studies-images', 'case-studies-images', true)
ON CONFLICT (id) DO NOTHING;

-- Crear política de almacenamiento para permitir subir imágenes
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'case-studies-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'case-studies-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'case-studies-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their images" ON storage.objects
  FOR DELETE USING (bucket_id = 'case-studies-images' AND auth.role() = 'authenticated');

-- Verificar que la función is_admin funciona correctamente y crear una alternativa si es necesario
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
$$;

-- Eliminar políticas existentes que podrían estar causando conflictos
DROP POLICY IF EXISTS "Admins can insert case studies" ON case_studies;
DROP POLICY IF EXISTS "Public can view active case studies" ON case_studies;

-- Recrear políticas con la nueva función
CREATE POLICY "Admins can insert case studies" ON case_studies
  FOR INSERT 
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Public can view active case studies" ON case_studies
  FOR SELECT 
  USING (is_active = true OR public.current_user_is_admin());
