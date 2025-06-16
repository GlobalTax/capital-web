
-- Deshabilitar completamente RLS en admin_users temporalmente para limpiar
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas problemáticas de admin_users
DROP POLICY IF EXISTS "Allow authenticated users full access to admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow all authenticated users to view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow all authenticated users to insert admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow all authenticated users to update admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- Limpiar cualquier función problemática
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Crear políticas RLS muy simples que NO usen funciones que referencien la misma tabla
CREATE POLICY "Allow all authenticated users to view admin_users" ON public.admin_users
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to insert admin_users" ON public.admin_users
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users to update admin_users" ON public.admin_users
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Volver a habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
