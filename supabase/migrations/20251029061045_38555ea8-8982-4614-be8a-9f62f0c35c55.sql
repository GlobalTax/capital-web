-- =====================================================
-- FASE 5: ADMIN USERS PROTECTION
-- =====================================================
-- Proteger información sensible de administradores
-- Solo super-admins pueden ver todos los admins
-- Admins regulares solo ven su propia información

-- 1. Reemplazar política de SELECT para admin_users
DROP POLICY IF EXISTS "Admins can view admin data" ON public.admin_users;

-- Super-admins ven todo, admins regulares solo su info
CREATE POLICY "SECURE_admin_users_select" 
ON public.admin_users 
FOR SELECT 
TO authenticated
USING (
  -- Super admins ven todo
  public.is_user_super_admin(auth.uid())
  OR
  -- Admins regulares solo ven su propia información
  (public.is_user_admin(auth.uid()) AND user_id = auth.uid())
);

-- 2. Añadir columnas para tracking de accesos sospechosos
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS last_info_access_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS info_access_count INTEGER DEFAULT 0;

-- 3. Comentarios de seguridad
COMMENT ON POLICY "SECURE_admin_users_select" ON public.admin_users IS 
'SECURITY: Super-admins can view all admin data. Regular admins can only view their own information to prevent social engineering attacks and privilege escalation.';