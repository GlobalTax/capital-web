
-- ============================================
-- OPCIÓN C: Acceso completo para admin y super_admin
-- ============================================

-- 1. Crear nueva función is_full_admin() para verificación explícita
CREATE OR REPLACE FUNCTION public.is_full_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = check_user_id 
      AND is_active = true
      AND role IN ('super_admin', 'admin')
  );
$$;

-- 2. Actualizar is_user_admin() para solo retornar TRUE para super_admin y admin
-- (Anteriormente retornaba TRUE para cualquier usuario en admin_users)
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = check_user_id 
      AND is_active = true
      AND role IN ('super_admin', 'admin')
  );
$$;

-- 3. Actualizar current_user_is_admin() para consistencia
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- 4. Dar acceso de lectura a admin para audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (is_user_admin(auth.uid()));

-- 5. Dar acceso de lectura a admin para tracking_events
DROP POLICY IF EXISTS "Admins can view tracking events" ON public.tracking_events;
CREATE POLICY "Admins can view tracking events"
ON public.tracking_events
FOR SELECT
USING (is_user_admin(auth.uid()));

-- 6. Comentarios para documentación
COMMENT ON FUNCTION public.is_full_admin(uuid) IS 'Returns TRUE only for super_admin and admin roles. Use for content/operations access.';
COMMENT ON FUNCTION public.is_user_admin(uuid) IS 'Returns TRUE only for super_admin and admin roles. Updated from previous behavior that included all admin_users.';
