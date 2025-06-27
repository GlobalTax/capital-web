
-- Habilitar Row Level Security en la tabla team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Crear política que permite acceso público de lectura a miembros activos
CREATE POLICY "Allow public read access to active team members" 
ON public.team_members 
FOR SELECT 
USING (is_active = true);

-- Crear política que permite acceso completo a administradores
CREATE POLICY "Allow admin full access to team members" 
ON public.team_members 
FOR ALL 
USING (public.current_user_is_admin());
