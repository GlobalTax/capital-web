-- Create sectors table for centralized sector management
CREATE TABLE public.sectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.sectors(id) ON DELETE CASCADE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

-- Create policies for sectors
CREATE POLICY "Anyone can view active sectors" 
ON public.sectors 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all sectors" 
ON public.sectors 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create indexes for performance
CREATE INDEX idx_sectors_slug ON public.sectors(slug);
CREATE INDEX idx_sectors_parent_id ON public.sectors(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_sectors_active_order ON public.sectors(is_active, display_order) WHERE is_active = true;

-- Create trigger for updated_at
CREATE TRIGGER update_sectors_updated_at
BEFORE UPDATE ON public.sectors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing sectors from STANDARD_SECTORS
INSERT INTO public.sectors (name_es, slug, display_order) VALUES
('Tecnología', 'tecnologia', 1),
('Servicios Financieros', 'servicios-financieros', 2),
('Salud y Biotecnología', 'salud-biotecnologia', 3),
('Industrial y Manufacturero', 'industrial-manufacturero', 4),
('Retail y Consumo', 'retail-consumo', 5),
('Educación', 'educacion', 6),
('Energía y Renovables', 'energia-renovables', 7),
('Inmobiliario', 'inmobiliario', 8),
('Alimentación y Bebidas', 'alimentacion-bebidas', 9),
('Automoción', 'automocion', 10),
('Logística y Transporte', 'logistica-transporte', 11),
('Telecomunicaciones', 'telecomunicaciones', 12),
('Medios y Entretenimiento', 'medios-entretenimiento', 13),
('Turismo y Hostelería', 'turismo-hosteleria', 14),
('Construcción', 'construccion', 15),
('Farmacéutico', 'farmaceutico', 16),
('Textil y Moda', 'textil-moda', 17),
('Químico', 'quimico', 18),
('Agricultura', 'agricultura', 19),
('Otros', 'otros', 20);