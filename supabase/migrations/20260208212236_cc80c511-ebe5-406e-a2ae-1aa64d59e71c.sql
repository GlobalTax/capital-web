
-- Create practice_area_cards table
CREATE TABLE public.practice_area_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  href TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.practice_area_cards ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view active practice areas"
ON public.practice_area_cards FOR SELECT
USING (true);

-- Admin write policies using admin_users table
CREATE POLICY "Admins can insert practice areas"
ON public.practice_area_cards FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can update practice areas"
ON public.practice_area_cards FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can delete practice areas"
ON public.practice_area_cards FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true));

-- Insert initial data
INSERT INTO public.practice_area_cards (title, description, href, display_order) VALUES
('Venta de empresas', 'Maximizamos el valor de tu empresa en el proceso de venta con una metodología probada y acceso a compradores cualificados.', '/servicios/venta-empresas', 1),
('Valoración de empresas', 'Informes de valoración profesionales basados en múltiples metodologías y comparables de mercado.', '/servicios/valoracion', 2),
('Due Diligence', 'Análisis exhaustivo financiero, legal y operativo para operaciones de compraventa.', '/servicios/due-diligence', 3),
('Planificación fiscal', 'Optimización de la estructura fiscal de la operación para maximizar el retorno neto.', '/servicios/planificacion-fiscal', 4);

-- Trigger for updated_at
CREATE TRIGGER update_practice_area_cards_updated_at
BEFORE UPDATE ON public.practice_area_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
