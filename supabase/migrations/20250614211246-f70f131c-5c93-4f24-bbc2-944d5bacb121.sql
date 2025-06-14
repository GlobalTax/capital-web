
-- Crear tabla para múltiplos por sector
CREATE TABLE public.sector_multiples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_name VARCHAR(100) NOT NULL UNIQUE,
  ebitda_multiple DECIMAL(4,2) NOT NULL,
  revenue_multiple DECIMAL(4,2) NOT NULL,
  description TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Insertar datos iniciales con múltiplos típicos del mercado
INSERT INTO public.sector_multiples (sector_name, ebitda_multiple, revenue_multiple, description) VALUES
('tecnologia', 12.5, 4.2, 'Empresas de software, SaaS, desarrollo tecnológico'),
('salud', 10.8, 3.1, 'Servicios sanitarios, farmacéuticas, dispositivos médicos'),
('manufactura', 8.2, 1.8, 'Fabricación industrial, maquinaria, productos manufacturados'),
('retail', 6.5, 1.2, 'Comercio minorista, distribución, e-commerce'),
('servicios', 9.1, 2.3, 'Servicios profesionales, consultoría, outsourcing'),
('finanzas', 11.2, 2.8, 'Servicios financieros, seguros, fintech'),
('inmobiliario', 9.8, 1.9, 'Desarrollo inmobiliario, gestión de propiedades'),
('energia', 7.4, 2.1, 'Energías renovables, petróleo, gas, utilities'),
('consultoria', 10.5, 3.8, 'Consultoría estratégica, tecnológica, especializada'),
('educacion', 8.9, 2.4, 'Educación, formación, e-learning'),
('turismo', 6.8, 1.6, 'Hotelería, restauración, agencias de viaje'),
('agricultura', 5.9, 1.4, 'Agricultura, ganadería, industria alimentaria'),
('otro', 8.0, 2.2, 'Otros sectores no especificados');

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_sector_multiples_sector ON public.sector_multiples(sector_name);
CREATE INDEX idx_sector_multiples_active ON public.sector_multiples(is_active);

-- Habilitar RLS (Row Level Security) - estos datos serán públicos de solo lectura
ALTER TABLE public.sector_multiples ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios
CREATE POLICY "Allow public read access to sector multiples" 
  ON public.sector_multiples 
  FOR SELECT 
  USING (is_active = true);
