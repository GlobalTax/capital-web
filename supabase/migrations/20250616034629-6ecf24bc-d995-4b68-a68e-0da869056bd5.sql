
-- Crear tabla para testimonios
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  client_position TEXT,
  testimonial_text TEXT NOT NULL,
  client_photo_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sector TEXT,
  project_type TEXT, -- tipo de proyecto: "venta", "valoración", "fusión", etc.
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (solo testimonios activos)
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
  FOR SELECT USING (is_active = true);

-- Políticas para administración (solo admins pueden modificar)
CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (public.is_admin(auth.uid()));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos testimonios de ejemplo
INSERT INTO public.testimonials (client_name, client_company, client_position, testimonial_text, sector, project_type, is_featured, display_order) VALUES
  ('Carlos Mendoza', 'TechSolutions SL', 'CEO y Fundador', 'Capittal nos ayudó a conseguir una valoración excepcional para nuestra empresa. Su equipo entendió perfectamente nuestro modelo de negocio tecnológico y logró posicionarnos ante inversores estratégicos. El proceso fue profesional y transparente en todo momento.', 'Tecnología', 'venta', true, 1),
  ('María González', 'BioMed Innovations', 'Directora General', 'La experiencia con Capittal en la venta de nuestra empresa fue extraordinaria. No solo superaron nuestras expectativas en valoración, sino que nos guiaron durante todo el proceso con un conocimiento profundo del sector salud. Altamente recomendables.', 'Salud', 'venta', true, 2),
  ('Javier Ruiz', 'RetailMax Group', 'Socio Fundador', 'Gracias a Capittal pudimos identificar al comprador perfecto para nuestra cadena de retail. Su red de contactos y estrategia de posicionamiento fueron clave para maximizar el valor de la operación. Un equipo excepcional.', 'Retail', 'venta', false, 3),
  ('Ana Martín', 'FinanceCore', 'CEO', 'La valoración que realizó Capittal de nuestra fintech fue fundamental para nuestras decisiones estratégicas. Su metodología es rigurosa y sus insights sobre el mercado financiero son invaluables.', 'Finanzas', 'valoración', false, 4);
