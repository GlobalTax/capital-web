BEGIN;

-- Asegurar RLS habilitado
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

-- Eliminar la política pública de lectura existente
DROP POLICY IF EXISTS "Anyone can view lead scores" ON public.lead_scores;

-- Restringir lectura solo a administradores autenticados
CREATE POLICY "Admins can select lead_scores"
ON public.lead_scores
FOR SELECT
TO authenticated
USING (public.current_user_is_admin());

COMMIT;