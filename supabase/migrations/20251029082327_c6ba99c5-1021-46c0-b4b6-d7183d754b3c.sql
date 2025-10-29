-- ===== MIGRACIÓN 3: Políticas Restrictivas para Contactos y Empresas =====

-- ===== TABLA: contactos =====

-- Eliminar política actual (demasiado permisiva)
DROP POLICY IF EXISTS "Admins can manage contactos" ON public.contactos;

-- Crear políticas específicas por operación
CREATE POLICY "Only admins can read contactos"
  ON public.contactos
  FOR SELECT
  TO authenticated
  USING (current_user_is_admin());

CREATE POLICY "Only admins can insert contactos"
  ON public.contactos
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_is_admin());

CREATE POLICY "Only admins can update contactos"
  ON public.contactos
  FOR UPDATE
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

CREATE POLICY "Only admins can delete contactos"
  ON public.contactos
  FOR DELETE
  TO authenticated
  USING (current_user_is_admin());

-- ===== TABLA: empresas =====

-- Eliminar política actual (demasiado permisiva)
DROP POLICY IF EXISTS "Admins can manage empresas" ON public.empresas;

-- Crear políticas específicas por operación
CREATE POLICY "Only admins can read empresas"
  ON public.empresas
  FOR SELECT
  TO authenticated
  USING (current_user_is_admin());

CREATE POLICY "Only admins can insert empresas"
  ON public.empresas
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_is_admin());

CREATE POLICY "Only admins can update empresas"
  ON public.empresas
  FOR UPDATE
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

CREATE POLICY "Only admins can delete empresas"
  ON public.empresas
  FOR DELETE
  TO authenticated
  USING (current_user_is_admin());