
-- Tabla para gestionar casos de éxito
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sector TEXT NOT NULL,
  company_size TEXT,
  value_amount DECIMAL,
  value_currency TEXT DEFAULT '€',
  description TEXT NOT NULL,
  highlights TEXT[], -- Array de puntos destacados
  year INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para gestionar operaciones realizadas
CREATE TABLE public.company_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  valuation_amount DECIMAL NOT NULL,
  valuation_currency TEXT DEFAULT '€',
  year INTEGER NOT NULL,
  description TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para gestionar estadísticas clave
CREATE TABLE public.key_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL UNIQUE, -- 'total_operations', 'total_value', 'years_experience', 'success_rate'
  metric_value TEXT NOT NULL,
  metric_label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para gestionar múltiplos por sector
CREATE TABLE public.sector_valuation_multiples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector_name TEXT NOT NULL,
  multiple_range TEXT NOT NULL, -- ej: "3.6x - 8.3x"
  median_multiple TEXT NOT NULL, -- ej: "7.2x"
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para roles de usuario
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'editor');

CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role admin_role NOT NULL DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_valuation_multiples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id 
    AND is_active = true
  )
$$;

-- Políticas RLS para lectura pública
CREATE POLICY "Anyone can view active case studies" ON public.case_studies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active operations" ON public.company_operations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active statistics" ON public.key_statistics
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active multiples" ON public.sector_valuation_multiples
  FOR SELECT USING (is_active = true);

-- Políticas RLS para administración (solo admins pueden modificar)
CREATE POLICY "Admins can manage case studies" ON public.case_studies
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage operations" ON public.company_operations
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage statistics" ON public.key_statistics
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage multiples" ON public.sector_valuation_multiples
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin' 
      AND is_active = true
    )
  );

-- Insertar datos iniciales
INSERT INTO public.key_statistics (metric_key, metric_value, metric_label, display_order) VALUES
  ('total_operations', '200+', 'Operaciones', 1),
  ('total_value', '€2.5B', 'Valor Total', 2),
  ('years_experience', '15', 'Años Experiencia', 3),
  ('success_rate', '85%', 'Tasa Éxito', 4);

INSERT INTO public.sector_valuation_multiples (sector_name, multiple_range, median_multiple, description, display_order) VALUES
  ('Salud', '3.6x - 8.3x', '7.2x', 'Múltiplos más altos del mercado', 1),
  ('Tecnología', '3.4x - 7.8x', '6.8x', 'Sector de alto crecimiento', 2),
  ('Finanzas', '3.2x - 7.5x', '6.3x', 'Estabilidad y regulación', 3),
  ('Manufactura', '3.3x - 7.2x', '6.2x', 'Capital intensivo', 4),
  ('Servicios', '2.9x - 6.7x', '5.8x', 'Amplio espectro', 5),
  ('Retail', '2.6x - 6.4x', '5.2x', 'Competencia intensa', 6);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON public.case_studies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON public.company_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON public.key_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_multiples_updated_at BEFORE UPDATE ON public.sector_valuation_multiples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
