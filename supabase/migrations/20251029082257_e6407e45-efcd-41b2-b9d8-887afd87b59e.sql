-- ===== MIGRACIÓN 1: Sistema de Roles para RH =====
-- Crear enum para roles de RH
CREATE TYPE public.rh_role AS ENUM ('rh_admin', 'rh_manager', 'rh_viewer');

-- Crear tabla de roles RH
CREATE TABLE public.rh_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.rh_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(user_id, role)
);

-- Habilitar RLS en la tabla de roles
ALTER TABLE public.rh_user_roles ENABLE ROW LEVEL SECURITY;

-- Política: Solo super admins pueden gestionar roles RH
CREATE POLICY "Super admins manage RH roles" 
  ON public.rh_user_roles
  FOR ALL 
  TO authenticated
  USING (is_user_super_admin(auth.uid()))
  WITH CHECK (is_user_super_admin(auth.uid()));

-- Política: Los usuarios pueden ver su propio rol
CREATE POLICY "Users can view own RH role"
  ON public.rh_user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Función SECURITY DEFINER para verificar roles RH
CREATE OR REPLACE FUNCTION public.has_rh_role(_user_id uuid, _role rh_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rh_user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Función helper: Verificar si usuario tiene acceso RH
CREATE OR REPLACE FUNCTION public.current_user_has_rh_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rh_user_roles
    WHERE user_id = auth.uid()
  ) OR is_user_super_admin(auth.uid());
$$;

-- Función helper: Verificar si usuario es RH admin
CREATE OR REPLACE FUNCTION public.current_user_is_rh_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_rh_role(auth.uid(), 'rh_admin') 
    OR is_user_super_admin(auth.uid());
$$;