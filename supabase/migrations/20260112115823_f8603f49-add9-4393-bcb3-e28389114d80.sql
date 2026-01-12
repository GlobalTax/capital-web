-- Mejora de seguridad: Reforzar funciones helper y políticas RLS para tabla contactos

-- 1. Actualizar función current_user_can_read() con verificación explícita de autenticación
CREATE OR REPLACE FUNCTION public.current_user_can_read()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE user_id = auth.uid() 
        AND is_active = true
        AND role IN ('super_admin', 'admin', 'viewer')
    );
$$;

-- 2. Actualizar función current_user_can_write() con verificación explícita de autenticación
CREATE OR REPLACE FUNCTION public.current_user_can_write()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM public.admin_users 
      WHERE user_id = auth.uid() 
        AND is_active = true
        AND role IN ('super_admin', 'admin')
    );
$$;

-- 3. Eliminar políticas antiguas de contactos
DROP POLICY IF EXISTS contactos_read ON public.contactos;
DROP POLICY IF EXISTS contactos_insert ON public.contactos;
DROP POLICY IF EXISTS contactos_update ON public.contactos;
DROP POLICY IF EXISTS contactos_delete ON public.contactos;
DROP POLICY IF EXISTS contactos_deny_anon ON public.contactos;

-- 4. Recrear políticas con rol explícito 'authenticated'
CREATE POLICY contactos_read ON public.contactos
  FOR SELECT
  TO authenticated
  USING (current_user_can_read());

CREATE POLICY contactos_insert ON public.contactos
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_can_write());

CREATE POLICY contactos_update ON public.contactos
  FOR UPDATE
  TO authenticated
  USING (current_user_can_write())
  WITH CHECK (current_user_can_write());

CREATE POLICY contactos_delete ON public.contactos
  FOR DELETE
  TO authenticated
  USING (current_user_can_write());

-- 5. Añadir política de denegación explícita para usuarios anónimos
CREATE POLICY contactos_deny_anon ON public.contactos
  FOR ALL
  TO anon
  USING (false);