-- =====================================================
-- FASE 10 MINI: Arreglar Admin Visibility
-- =====================================================
-- Objetivo: Restringir acceso a datos de otros admins
-- Solo super_admins pueden ver todos los perfiles
-- Otros admins solo ven su propio perfil
-- =====================================================

-- 1. Eliminar política actual (demasiado permisiva)
DROP POLICY IF EXISTS "Admins can view other admins" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admins to read admin_users" ON public.admin_users;

-- 2. Crear política restrictiva para lectura
CREATE POLICY "Admins can view own profile or super_admin sees all"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR is_user_super_admin(auth.uid())
  );

-- 3. Mantener políticas de escritura solo para super_admins
-- (ya existen, solo verificamos que estén correctas)
DROP POLICY IF EXISTS "Super admins can insert admin_users" ON public.admin_users;
CREATE POLICY "Super admins can insert admin_users"
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (is_user_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can update admin_users" ON public.admin_users;
CREATE POLICY "Super admins can update admin_users"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (is_user_super_admin(auth.uid()))
  WITH CHECK (is_user_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can delete admin_users" ON public.admin_users;
CREATE POLICY "Super admins can delete admin_users"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (is_user_super_admin(auth.uid()));

-- 4. Log de seguridad
SELECT log_security_event(
  'ADMIN_VISIBILITY_RESTRICTED',
  'medium',
  'admin_users',
  'ALTER',
  jsonb_build_object(
    'action', 'Restricted admin_users visibility to own profile only',
    'timestamp', now()
  )
);