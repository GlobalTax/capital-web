-- ===== MIGRACIÓN 2: Políticas RLS Seguras para Tablas RH =====

-- ===== TABLA: rh_empleados =====

-- Eliminar política pública PELIGROSA
DROP POLICY IF EXISTS "Public read" ON public.rh_empleados;

-- Crear políticas seguras basadas en roles RH
CREATE POLICY "RH users can read empleados"
  ON public.rh_empleados
  FOR SELECT
  TO authenticated
  USING (current_user_has_rh_access());

CREATE POLICY "RH admins can insert empleados"
  ON public.rh_empleados
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_is_rh_admin());

CREATE POLICY "RH admins can update empleados"
  ON public.rh_empleados
  FOR UPDATE
  TO authenticated
  USING (current_user_is_rh_admin())
  WITH CHECK (current_user_is_rh_admin());

CREATE POLICY "RH admins can delete empleados"
  ON public.rh_empleados
  FOR DELETE
  TO authenticated
  USING (current_user_is_rh_admin());

-- ===== TABLA: rh_nominas =====

-- Eliminar política pública PELIGROSA
DROP POLICY IF EXISTS "Public read" ON public.rh_nominas;

-- Crear políticas seguras basadas en roles RH
CREATE POLICY "RH users can read nominas"
  ON public.rh_nominas
  FOR SELECT
  TO authenticated
  USING (current_user_has_rh_access());

CREATE POLICY "RH admins can insert nominas"
  ON public.rh_nominas
  FOR INSERT
  TO authenticated
  WITH CHECK (current_user_is_rh_admin());

CREATE POLICY "RH admins can update nominas"
  ON public.rh_nominas
  FOR UPDATE
  TO authenticated
  USING (current_user_is_rh_admin())
  WITH CHECK (current_user_is_rh_admin());

CREATE POLICY "RH admins can delete nominas"
  ON public.rh_nominas
  FOR DELETE
  TO authenticated
  USING (current_user_is_rh_admin());