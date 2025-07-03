-- Investigar el problema de permisos y solucionarlo
-- Primero vamos a verificar las políticas actuales

-- Deshabilitar RLS temporalmente para hacer un test
ALTER TABLE public.contact_leads DISABLE ROW LEVEL SECURITY;

-- Test de inserción
INSERT INTO public.contact_leads (
  full_name, 
  company, 
  email, 
  phone, 
  country, 
  company_size
) VALUES (
  'Test Usuario', 
  'Test Company', 
  'test@ejemplo.com', 
  '+34 600 000 000', 
  'es', 
  '1-5m'
);

-- Volver a habilitar RLS
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- Recrear todas las políticas de forma más permisiva
DROP POLICY IF EXISTS "Enable public insert for contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admin users can view contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admin users can update contact leads" ON public.contact_leads;

-- Política permisiva para inserción (usuarios anónimos y autenticados)
CREATE POLICY "Allow all insert contact leads" 
  ON public.contact_leads 
  FOR INSERT 
  WITH CHECK (true);

-- Política para lectura solo para admins
CREATE POLICY "Admins can read contact leads" 
  ON public.contact_leads 
  FOR SELECT 
  TO authenticated
  USING (current_user_is_admin());

-- Política para actualización solo para admins
CREATE POLICY "Admins can update contact leads" 
  ON public.contact_leads 
  FOR UPDATE 
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());