-- Migración para soportar proyecto de asesorías

-- 1. Agregar campo source_project para diferenciar proyectos
ALTER TABLE public.company_valuations 
ADD COLUMN source_project TEXT DEFAULT 'capittal-main';

-- 2. Crear tabla específica para múltiplos de asesorías
CREATE TABLE public.sector_multiples_asesorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_name TEXT NOT NULL,
  employee_range TEXT NOT NULL,
  ebitda_multiple NUMERIC NOT NULL,
  revenue_multiple NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sector_name, employee_range)
);

-- 3. Habilitar RLS en la nueva tabla
ALTER TABLE public.sector_multiples_asesorias ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para sector_multiples_asesorias
CREATE POLICY "Anyone can view asesorias multiples" 
ON public.sector_multiples_asesorias 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage asesorias multiples" 
ON public.sector_multiples_asesorias 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- 5. Insertar datos iniciales para asesorías
INSERT INTO public.sector_multiples_asesorias (sector_name, employee_range, ebitda_multiple, revenue_multiple, description) VALUES
('asesoria_fiscal', '1-2', 3.5, 0.8, 'Asesorías fiscales pequeñas'),
('asesoria_fiscal', '3-5', 4.2, 1.0, 'Asesorías fiscales medianas'),
('asesoria_fiscal', '6-10', 5.0, 1.2, 'Asesorías fiscales establecidas'),
('asesoria_fiscal', '11-25', 5.8, 1.4, 'Asesorías fiscales grandes'),
('asesoria_laboral', '1-2', 3.2, 0.7, 'Asesorías laborales pequeñas'),
('asesoria_laboral', '3-5', 4.0, 0.9, 'Asesorías laborales medianas'),
('asesoria_laboral', '6-10', 4.8, 1.1, 'Asesorías laborales establecidas'),
('asesoria_laboral', '11-25', 5.5, 1.3, 'Asesorías laborales grandes'),
('asesoria_contable', '1-2', 3.8, 0.9, 'Asesorías contables pequeñas'),
('asesoria_contable', '3-5', 4.5, 1.1, 'Asesorías contables medianas'),
('asesoria_contable', '6-10', 5.2, 1.3, 'Asesorías contables establecidas'),
('asesoria_contable', '11-25', 6.0, 1.5, 'Asesorías contables grandes'),
('asesoria_integral', '1-2', 4.0, 1.0, 'Asesorías integrales pequeñas'),
('asesoria_integral', '3-5', 4.8, 1.2, 'Asesorías integrales medianas'),
('asesoria_integral', '6-10', 5.5, 1.4, 'Asesorías integrales establecidas'),
('asesoria_integral', '11-25', 6.5, 1.6, 'Asesorías integrales grandes');

-- 6. Crear función trigger para updated_at en asesorías
CREATE TRIGGER update_asesorias_multiples_updated_at
BEFORE UPDATE ON public.sector_multiples_asesorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Actualizar registros existentes con el source_project por defecto
UPDATE public.company_valuations 
SET source_project = 'capittal-main' 
WHERE source_project IS NULL;