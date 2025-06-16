
-- Eliminar la función actual que causa recursión
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Crear una función SECURITY DEFINER que evite la recursión
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id 
    AND is_active = true
  )
$$;

-- Eliminar las políticas RLS problemáticas de admin_users
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- Crear nuevas políticas RLS más simples para admin_users
CREATE POLICY "Authenticated users can view their own admin record" ON public.admin_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage admin users" ON public.admin_users
  FOR ALL USING (auth.role() = 'service_role');
