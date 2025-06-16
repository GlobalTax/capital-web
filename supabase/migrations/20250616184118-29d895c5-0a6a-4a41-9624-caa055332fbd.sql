
-- Crear tabla para gestionar los miembros del equipo
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  bio TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar los miembros actuales del equipo
INSERT INTO public.team_members (name, image_url, display_order) VALUES
  ('Carlos Martínez', '/lovable-uploads/5459d292-9157-404f-915b-a1608e1f4779.png', 1),
  ('Ana Rodriguez', '/lovable-uploads/b3d6115b-5184-49d6-8c1d-3493d1d72ca7.png', 2),
  ('Miguel Santos', '/lovable-uploads/3aeb6303-e888-4dde-846f-88ec5c6606ae.png', 3),
  ('David López', '/lovable-uploads/8c3bfca2-1cf0-42a1-935b-61cf6c319ecb.png', 4),
  ('Roberto García', '/lovable-uploads/20da2e90-43c8-4c44-a119-a68b49bf41c0.png', 5),
  ('Antonio Navarro', '/lovable-uploads/dfc75c41-289d-4bfd-963f-7838a1a06225.png', 6);
