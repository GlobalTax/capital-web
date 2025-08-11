-- Secure company_valuations by restricting public read access
-- 1) Ensure RLS is enabled (idempotent)
ALTER TABLE public.company_valuations ENABLE ROW LEVEL SECURITY;

-- 2) Drop overly-permissive SELECT policies
DROP POLICY IF EXISTS "Enable read for anonymous users" ON public.company_valuations;
DROP POLICY IF EXISTS "Permitir a usuarios autenticados leer las valoraciones" ON public.company_valuations;

-- 3) Restrict SELECT to admins only
CREATE POLICY "Admins can read company valuations"
ON public.company_valuations
FOR SELECT
USING (current_user_is_admin());

-- Nota: mantenemos la política existente de INSERT para anónimos para no romper el envío del formulario
-- No se crean políticas de UPDATE/DELETE, permanecen deshabilitadas por defecto.