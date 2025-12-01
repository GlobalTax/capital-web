-- Política de lectura para administradores
CREATE POLICY "Admins can read all professional valuations"
ON public.professional_valuations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Política de inserción para administradores
CREATE POLICY "Admins can create professional valuations"
ON public.professional_valuations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Política de actualización para administradores
CREATE POLICY "Admins can update professional valuations"
ON public.professional_valuations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Política de eliminación para administradores
CREATE POLICY "Admins can delete professional valuations"
ON public.professional_valuations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);