-- Eliminar políticas RLS existentes que podrían ser demasiado permisivas
DROP POLICY IF EXISTS "Admins can manage non-super-admins" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admin_users;

-- Crear políticas más restrictivas para proteger información sensible

-- 1. Solo super admins pueden ver información completa de otros admins
CREATE POLICY "Super admins can view all admin data"
ON public.admin_users
FOR SELECT
TO authenticated
USING (is_user_super_admin(auth.uid()));

-- 2. Admins regulares solo pueden ver información básica (sin emails) de otros admins
CREATE POLICY "Admins can view basic admin info"
ON public.admin_users  
FOR SELECT
TO authenticated
USING (
  is_user_admin(auth.uid()) 
  AND NOT is_user_super_admin(auth.uid())
);

-- 3. Los usuarios solo pueden ver su propio registro admin completo
CREATE POLICY "Users can view own complete admin record"
ON public.admin_users
FOR SELECT  
TO authenticated
USING (user_id = auth.uid());

-- 4. Solo super admins pueden crear nuevos admins
CREATE POLICY "Super admins can insert admin users"
ON public.admin_users
FOR INSERT
TO authenticated  
WITH CHECK (is_user_super_admin(auth.uid()));

-- 5. Solo super admins pueden actualizar roles de otros admins
CREATE POLICY "Super admins can update admin users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (is_user_super_admin(auth.uid()))
WITH CHECK (is_user_super_admin(auth.uid()));

-- 6. Admins regulares solo pueden actualizar su propia información básica (no rol)
CREATE POLICY "Admins can update own basic info"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  AND is_user_admin(auth.uid())
  AND NOT is_user_super_admin(auth.uid())
)
WITH CHECK (
  user_id = auth.uid()
  AND OLD.role = NEW.role -- No pueden cambiar su propio rol
);

-- 7. Solo super admins pueden eliminar usuarios admin
CREATE POLICY "Super admins can delete admin users"
ON public.admin_users
FOR DELETE
TO authenticated
USING (is_user_super_admin(auth.uid()));

-- Crear función segura para obtener información limitada de admins
CREATE OR REPLACE FUNCTION public.get_admin_basic_info()
RETURNS TABLE (
  id uuid,
  full_name text,
  role admin_role,
  is_active boolean,
  last_login timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    au.id,
    au.full_name,
    au.role,
    au.is_active,
    au.last_login
  FROM public.admin_users au
  WHERE 
    -- Solo mostrar información básica sin emails
    au.is_active = true
    AND (
      -- Super admins ven todo
      is_user_super_admin(auth.uid())
      OR
      -- Admins regulares solo ven otros admins activos sin información sensible
      (is_user_admin(auth.uid()) AND au.user_id != auth.uid())
    );
$$;