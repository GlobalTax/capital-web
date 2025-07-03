-- Verificar y arreglar las políticas RLS para contact_leads
-- El problema es que la política de inserción puede no estar funcionando correctamente

-- Primero eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Anyone can insert contact leads" ON public.contact_leads;

-- Crear política mejorada para inserción pública
CREATE POLICY "Enable public insert for contact leads" 
  ON public.contact_leads 
  FOR INSERT 
  WITH CHECK (true);

-- Asegurar que las políticas de admin funcionan correctamente
DROP POLICY IF EXISTS "Admins can view contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admins can manage contact leads" ON public.contact_leads;

CREATE POLICY "Admin users can view contact leads" 
  ON public.contact_leads 
  FOR SELECT 
  TO authenticated
  USING (current_user_is_admin());

CREATE POLICY "Admin users can update contact leads" 
  ON public.contact_leads 
  FOR UPDATE 
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Verificar que RLS está habilitado
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;