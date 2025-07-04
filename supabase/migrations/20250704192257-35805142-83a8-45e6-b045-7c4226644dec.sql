-- Crear tabla para recursos de diseño
CREATE TABLE public.design_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('style-guide', 'graphics', 'templates', 'fonts', 'icons', 'components', 'other')),
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.design_resources ENABLE ROW LEVEL SECURITY;

-- Create policies for design resources
CREATE POLICY "Admins can manage design resources" 
ON public.design_resources 
FOR ALL 
USING (current_user_is_admin());

CREATE POLICY "Anyone can view active design resources" 
ON public.design_resources 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_design_resources_updated_at
BEFORE UPDATE ON public.design_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some example design resources
INSERT INTO public.design_resources (title, description, url, category, display_order) VALUES
('Guía de Marca Capittal', 'Guía completa de la identidad visual de Capittal', 'https://example.com/brand-guide', 'style-guide', 1),
('Logo Capittal', 'Archivos del logo en diferentes formatos', 'https://example.com/logo-files', 'graphics', 2),
('Tipografía Corporativa', 'Fuentes utilizadas en el diseño web', 'https://fonts.google.com/specimen/Inter', 'fonts', 3),
('Iconos UI', 'Biblioteca de iconos para la interfaz', 'https://lucide.dev/', 'icons', 4);