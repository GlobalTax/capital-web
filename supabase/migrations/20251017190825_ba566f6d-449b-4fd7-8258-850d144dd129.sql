-- ===================================================
-- Sistema de Autenticación Robusto - Database Functions
-- ===================================================

-- 1. Función simple para verificar si un usuario es admin (cualquier nivel)
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = check_user_id 
      AND is_active = true
  );
$$;

-- 2. Función para obtener el rol específico del usuario
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role::text 
     FROM public.admin_users 
     WHERE user_id = check_user_id 
       AND is_active = true
     LIMIT 1
    ), 
    'none'
  );
$$;

-- 3. Índice para optimizar las consultas de admin
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id_active 
ON public.admin_users (user_id, is_active) 
WHERE is_active = true;

-- 4. Comentarios para documentación
COMMENT ON FUNCTION public.is_user_admin(uuid) IS 
'Verifica si un usuario tiene permisos de administrador activos. Usa SECURITY DEFINER para evitar recursión RLS.';

COMMENT ON FUNCTION public.get_user_role(uuid) IS 
'Retorna el rol específico del usuario (super_admin, admin, editor, viewer) o none si no es admin.';
