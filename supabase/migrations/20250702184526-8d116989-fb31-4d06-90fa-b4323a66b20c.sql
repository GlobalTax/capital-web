-- Crear sistema de propuestas de honorarios

-- Enum para estados de propuestas
CREATE TYPE public.proposal_status AS ENUM ('draft', 'sent', 'viewed', 'approved', 'rejected', 'expired');

-- Enum para tipos de servicios
CREATE TYPE public.service_type AS ENUM ('venta_empresas', 'due_diligence', 'valoraciones', 'asesoramiento_legal', 'planificacion_fiscal', 'reestructuraciones');

-- Tabla de plantillas de honorarios
CREATE TABLE public.fee_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service_type service_type NOT NULL,
  description TEXT,
  base_fee_percentage NUMERIC DEFAULT 0,
  minimum_fee NUMERIC DEFAULT 0,
  success_fee_percentage NUMERIC DEFAULT 0,
  template_sections JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla principal de propuestas
CREATE TABLE public.fee_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_company TEXT,
  client_phone TEXT,
  service_type service_type NOT NULL,
  template_id UUID REFERENCES public.fee_templates(id),
  
  -- Datos financieros
  transaction_value NUMERIC,
  estimated_fee NUMERIC,
  base_fee_percentage NUMERIC DEFAULT 0,
  success_fee_percentage NUMERIC DEFAULT 0,
  minimum_fee NUMERIC DEFAULT 0,
  
  -- Contenido de la propuesta
  proposal_title TEXT NOT NULL,
  proposal_content JSONB DEFAULT '{}'::jsonb,
  sections JSONB DEFAULT '[]'::jsonb,
  terms_and_conditions TEXT,
  
  -- Estado y seguimiento
  status proposal_status DEFAULT 'draft',
  valid_until DATE,
  unique_url TEXT UNIQUE,
  
  -- Datos de contacto relacionados
  contact_lead_id UUID REFERENCES public.contact_leads(id),
  company_valuation_id UUID REFERENCES public.company_valuations(id),
  
  -- Metadatos
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de secciones modulares
CREATE TABLE public.proposal_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service_type service_type,
  content_template TEXT,
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  section_type TEXT DEFAULT 'content', -- 'content', 'fees', 'terms', 'appendix'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de actividades de propuestas (tracking)
CREATE TABLE public.proposal_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.fee_proposals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'viewed', 'downloaded', 'shared', 'section_viewed'
  ip_address INET,
  user_agent TEXT,
  activity_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.fee_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plantillas
CREATE POLICY "Admins can manage fee templates" 
ON public.fee_templates 
FOR ALL 
USING (public.current_user_is_admin());

CREATE POLICY "Anyone can view active templates" 
ON public.fee_templates 
FOR SELECT 
USING (is_active = true);

-- Políticas RLS para propuestas
CREATE POLICY "Admins can manage all proposals" 
ON public.fee_proposals 
FOR ALL 
USING (public.current_user_is_admin());

CREATE POLICY "Public can view proposals via unique URL" 
ON public.fee_proposals 
FOR SELECT 
USING (status IN ('sent', 'viewed') AND valid_until >= CURRENT_DATE);

-- Políticas RLS para secciones
CREATE POLICY "Admins can manage proposal sections" 
ON public.proposal_sections 
FOR ALL 
USING (public.current_user_is_admin());

CREATE POLICY "Anyone can view active sections" 
ON public.proposal_sections 
FOR SELECT 
USING (is_active = true);

-- Políticas RLS para actividades
CREATE POLICY "Admins can view all activities" 
ON public.proposal_activities 
FOR SELECT 
USING (public.current_user_is_admin());

CREATE POLICY "System can insert activities" 
ON public.proposal_activities 
FOR INSERT 
WITH CHECK (true);

-- Función para generar número de propuesta único
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year TEXT;
  sequence_num TEXT;
  proposal_number TEXT;
BEGIN
  current_year := EXTRACT(year FROM now())::TEXT;
  
  -- Obtener siguiente número en secuencia para este año
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') INTO sequence_num
  FROM public.fee_proposals 
  WHERE EXTRACT(year FROM created_at) = EXTRACT(year FROM now());
  
  proposal_number := 'PROP-' || current_year || '-' || sequence_num;
  
  RETURN proposal_number;
END;
$$;

-- Función para generar URL única
CREATE OR REPLACE FUNCTION public.generate_unique_proposal_url()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  unique_string TEXT;
BEGIN
  unique_string := encode(gen_random_bytes(16), 'hex');
  RETURN unique_string;
END;
$$;

-- Trigger para auto-generar número de propuesta y URL única
CREATE OR REPLACE FUNCTION public.handle_new_proposal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.proposal_number IS NULL THEN
    NEW.proposal_number := public.generate_proposal_number();
  END IF;
  
  IF NEW.unique_url IS NULL THEN
    NEW.unique_url := public.generate_unique_proposal_url();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_new_proposal
  BEFORE INSERT ON public.fee_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_proposal();

-- Trigger para actualizar updated_at
CREATE TRIGGER update_fee_templates_updated_at
  BEFORE UPDATE ON public.fee_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_proposals_updated_at
  BEFORE UPDATE ON public.fee_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar plantillas por defecto
INSERT INTO public.fee_templates (name, service_type, description, base_fee_percentage, minimum_fee, success_fee_percentage) VALUES
('Venta de Empresas - Estándar', 'venta_empresas', 'Plantilla estándar para procesos de venta de empresas', 3.5, 25000, 1.5),
('Due Diligence - Completo', 'due_diligence', 'Plantilla para procesos de due diligence completos', 0, 15000, 0),
('Valoración Empresarial', 'valoraciones', 'Plantilla para servicios de valoración de empresas', 0, 8000, 0),
('Asesoramiento Legal M&A', 'asesoramiento_legal', 'Plantilla para asesoramiento legal en M&A', 0, 12000, 0),
('Planificación Fiscal', 'planificacion_fiscal', 'Plantilla para servicios de planificación fiscal', 0, 6000, 0),
('Reestructuración Empresarial', 'reestructuraciones', 'Plantilla para procesos de reestructuración', 2.5, 20000, 0);

-- Insertar secciones por defecto
INSERT INTO public.proposal_sections (name, service_type, content_template, display_order, is_required, section_type) VALUES
('Introducción', NULL, 'Introducción y presentación de Capittal como empresa líder en M&A en España.', 1, true, 'content'),
('Alcance del Servicio', NULL, 'Descripción detallada del servicio a prestar y metodología a seguir.', 2, true, 'content'),
('Estructura de Honorarios', NULL, 'Detalle de la estructura de honorarios propuesta para el proyecto.', 3, true, 'fees'),
('Cronograma', NULL, 'Cronograma estimado del proyecto con hitos principales.', 4, false, 'content'),
('Equipo Asignado', NULL, 'Presentación del equipo que trabajará en el proyecto.', 5, false, 'content'),
('Términos y Condiciones', NULL, 'Términos y condiciones del servicio.', 6, true, 'terms'),
('Próximos Pasos', NULL, 'Pasos a seguir una vez aceptada la propuesta.', 7, false, 'content');

-- Comentarios para documentación
COMMENT ON TABLE public.fee_proposals IS 'Tabla principal para almacenar propuestas de honorarios de Capittal';
COMMENT ON TABLE public.fee_templates IS 'Plantillas reutilizables para diferentes tipos de servicios';
COMMENT ON TABLE public.proposal_sections IS 'Secciones modulares para construir propuestas';
COMMENT ON TABLE public.proposal_activities IS 'Seguimiento de actividades en propuestas enviadas';