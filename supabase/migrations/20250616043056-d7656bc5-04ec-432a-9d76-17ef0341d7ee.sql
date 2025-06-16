
-- Eliminar todas las políticas existentes primero
DROP POLICY IF EXISTS "Admins can insert case studies" ON case_studies;
DROP POLICY IF EXISTS "Public can view active case studies" ON case_studies;
DROP POLICY IF EXISTS "Admins can update case studies" ON case_studies;
DROP POLICY IF EXISTS "Admins can delete case studies" ON case_studies;
DROP POLICY IF EXISTS "Admins can view all case studies" ON case_studies;
DROP POLICY IF EXISTS "Admins can manage case studies" ON case_studies;

DROP POLICY IF EXISTS "Admins can manage operations" ON company_operations;
DROP POLICY IF EXISTS "Public can view active operations" ON company_operations;
DROP POLICY IF EXISTS "Admins can view all operations" ON company_operations;
DROP POLICY IF EXISTS "Admins can insert operations" ON company_operations;
DROP POLICY IF EXISTS "Admins can update operations" ON company_operations;
DROP POLICY IF EXISTS "Admins can delete operations" ON company_operations;

DROP POLICY IF EXISTS "Admins can manage statistics" ON key_statistics;
DROP POLICY IF EXISTS "Public can view active statistics" ON key_statistics;
DROP POLICY IF EXISTS "Admins can view all statistics" ON key_statistics;
DROP POLICY IF EXISTS "Admins can insert statistics" ON key_statistics;
DROP POLICY IF EXISTS "Admins can update statistics" ON key_statistics;
DROP POLICY IF EXISTS "Admins can delete statistics" ON key_statistics;

DROP POLICY IF EXISTS "Admins can manage multiples" ON sector_valuation_multiples;
DROP POLICY IF EXISTS "Public can view active multiples" ON sector_valuation_multiples;
DROP POLICY IF EXISTS "Admins can view all multiples" ON sector_valuation_multiples;
DROP POLICY IF EXISTS "Admins can insert multiples" ON sector_valuation_multiples;
DROP POLICY IF EXISTS "Admins can update multiples" ON sector_valuation_multiples;
DROP POLICY IF EXISTS "Admins can delete multiples" ON sector_valuation_multiples;

DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view active testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can view all testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON testimonials;

DROP POLICY IF EXISTS "Allow authenticated users to view admin records" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to insert admin records" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can view their own admin record" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;

-- Eliminar la función problemática y todas sus dependencias con CASCADE
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Crear la nueva función sin recursión
CREATE OR REPLACE FUNCTION public.check_is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true
  )
$$;

-- Deshabilitar temporalmente RLS en admin_users para configuración inicial
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Insertar el usuario actual como admin
INSERT INTO public.admin_users (user_id, role, is_active)
SELECT auth.uid(), 'super_admin', true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  is_active = true;

-- Volver a habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Recrear políticas usando la nueva función check_is_admin

-- Políticas para admin_users
CREATE POLICY "Allow authenticated users to view admin records" ON public.admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert admin records" ON public.admin_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para case_studies
CREATE POLICY "Admins can insert case studies" ON case_studies
  FOR INSERT WITH CHECK (public.check_is_admin(auth.uid()));

CREATE POLICY "Public can view active case studies" ON case_studies
  FOR SELECT USING (is_active = true OR public.check_is_admin(auth.uid()));

CREATE POLICY "Admins can update case studies" ON case_studies
  FOR UPDATE USING (public.check_is_admin(auth.uid()));

CREATE POLICY "Admins can delete case studies" ON case_studies
  FOR DELETE USING (public.check_is_admin(auth.uid()));

-- Políticas para company_operations
CREATE POLICY "Admins can manage operations" ON company_operations
  FOR ALL USING (public.check_is_admin(auth.uid()));

CREATE POLICY "Public can view active operations" ON company_operations
  FOR SELECT USING (is_active = true OR public.check_is_admin(auth.uid()));

-- Políticas para key_statistics
CREATE POLICY "Admins can manage statistics" ON key_statistics
  FOR ALL USING (public.check_is_admin(auth.uid()));

CREATE POLICY "Public can view active statistics" ON key_statistics
  FOR SELECT USING (is_active = true OR public.check_is_admin(auth.uid()));

-- Políticas para sector_valuation_multiples
CREATE POLICY "Admins can manage multiples" ON sector_valuation_multiples
  FOR ALL USING (public.check_is_admin(auth.uid()));

CREATE POLICY "Public can view active multiples" ON sector_valuation_multiples
  FOR SELECT USING (is_active = true OR public.check_is_admin(auth.uid()));

-- Políticas para testimonials
CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL USING (public.check_is_admin(auth.uid()));

CREATE POLICY "Public can view active testimonials" ON testimonials
  FOR SELECT USING (is_active = true OR public.check_is_admin(auth.uid()));

-- Actualizar la función current_user_is_admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT public.check_is_admin(auth.uid());
$$;
