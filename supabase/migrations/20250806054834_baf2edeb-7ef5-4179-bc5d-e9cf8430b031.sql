-- Create hero_slides table for dynamic hero slider content
CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_primary_text TEXT,
  cta_primary_url TEXT,
  cta_secondary_text TEXT,
  cta_secondary_url TEXT,
  image_url TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  autoplay_duration INTEGER DEFAULT 5000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active hero slides" 
ON public.hero_slides 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage hero slides" 
ON public.hero_slides 
FOR ALL 
USING (current_user_is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default slides
INSERT INTO public.hero_slides (title, subtitle, description, cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url, display_order) VALUES
('Expertos en M&A y Valoraciones', 'Capittal', 'Maximizamos el valor de tu empresa con estrategias personalizadas de fusiones, adquisiciones y valoraciones empresariales.', 'Solicitar Consulta', '/contacto', 'Ver Casos de Éxito', '/casos-exito', 1),
('Valoraciones Empresariales Precisas', 'Conoce el verdadero valor', 'Obten una valoración profesional de tu empresa con nuestros métodos contrastados y años de experiencia.', 'Calcular Valoración', '/valoraciones', 'Ver Metodología', '/servicios', 2);