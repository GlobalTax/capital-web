BEGIN;

-- Asegurar RLS habilitado
ALTER TABLE public.lead_alerts ENABLE ROW LEVEL SECURITY;

-- Eliminar la política pública de lectura existente
DROP POLICY IF EXISTS "Anyone can view lead alerts" ON public.lead_alerts;

-- Restringir lectura solo a administradores autenticados
CREATE POLICY "Admins can view lead alerts"
ON public.lead_alerts
FOR SELECT
TO authenticated
USING (public.current_user_is_admin());

COMMIT;