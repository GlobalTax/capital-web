-- Secure lead_behavior_events by restricting public read access
-- 1) Ensure RLS is enabled (idempotent)
ALTER TABLE public.lead_behavior_events ENABLE ROW LEVEL SECURITY;

-- 2) Drop overly-permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view behavior events" ON public.lead_behavior_events;

-- 3) Restrict SELECT to admins only
CREATE POLICY "Admins can view behavior events"
ON public.lead_behavior_events
FOR SELECT
USING (current_user_is_admin());

-- Nota: mantenemos la política existente de INSERT para anónimos para no romper el tracking actual
-- No se crean políticas de UPDATE/DELETE, permanecen deshabilitadas por defecto.