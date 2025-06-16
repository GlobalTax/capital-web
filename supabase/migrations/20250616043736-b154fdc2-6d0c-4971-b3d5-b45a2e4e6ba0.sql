
-- Deshabilitar completamente RLS en admin_users temporalmente para limpiar
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas problemáticas de admin_users
DROP POLICY IF EXISTS "Allow authenticated users to view admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to insert admin records" ON public.admin_users;
DROP POLICY IF EXISTS "Authenticated users can view their own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON public.admin_users;

-- Limpiar cualquier función problemática
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Insertar el usuario actual como super admin sin restricciones RLS
INSERT INTO public.admin_users (user_id, role, is_active)
SELECT auth.uid(), 'super_admin', true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  is_active = true;

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

-- Verificar que el usuario actual está en la tabla
SELECT * FROM public.admin_users WHERE user_id = auth.uid();
