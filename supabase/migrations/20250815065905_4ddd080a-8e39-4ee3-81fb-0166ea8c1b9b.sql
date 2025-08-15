-- Corregir políticas RLS de la tabla lead_scores para proteger datos sensibles de tracking

-- Primero, eliminar todas las políticas existentes que pueden ser inseguras
DROP POLICY IF EXISTS "Anyone can insert lead scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Anyone can update lead scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Admins can view lead scores" ON public.lead_scores;

-- Recrear políticas RLS seguras

-- 1. Solo administradores pueden ver los lead scores (datos sensibles)
CREATE POLICY "Admins can view lead scores" 
ON public.lead_scores 
FOR SELECT 
TO authenticated
USING (current_user_is_admin());

-- 2. Solo el sistema (service_role) puede insertar nuevos lead scores desde el tracking
CREATE POLICY "System can insert lead scores" 
ON public.lead_scores 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 3. Solo administradores pueden actualizar lead scores
CREATE POLICY "Admins can update lead scores" 
ON public.lead_scores 
FOR UPDATE 
TO authenticated
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- 4. Solo administradores pueden eliminar lead scores
CREATE POLICY "Admins can delete lead scores" 
ON public.lead_scores 
FOR DELETE 
TO authenticated
USING (current_user_is_admin());

-- 5. Permitir a edge functions insertar/actualizar (usan service_role)
CREATE POLICY "Edge functions can manage lead scores" 
ON public.lead_scores 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Asegurarse de que RLS esté habilitado
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

-- Comentario para documentar la seguridad
COMMENT ON TABLE public.lead_scores IS 'Tabla de puntuación de leads - Contiene datos sensibles de tracking. Solo accesible por administradores y sistema.';