
-- Crear tabla para leads de contacto
CREATE TABLE public.contact_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  country TEXT,
  company_size TEXT,
  referral TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new',
  hubspot_sent BOOLEAN DEFAULT false,
  hubspot_sent_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT
);

-- Crear tabla para solicitudes del programa de colaboradores
CREATE TABLE public.collaborator_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  profession TEXT NOT NULL,
  experience TEXT,
  motivation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  hubspot_sent BOOLEAN DEFAULT false,
  hubspot_sent_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT
);

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_contact_leads_updated_at 
  BEFORE UPDATE ON public.contact_leads 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaborator_applications_updated_at 
  BEFORE UPDATE ON public.collaborator_applications 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS (Row Level Security) para acceso público de lectura/escritura
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_applications ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir inserción pública (formularios del sitio web)
CREATE POLICY "Anyone can insert contact leads" 
  ON public.contact_leads 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can insert collaborator applications" 
  ON public.collaborator_applications 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas para que solo admins puedan leer y actualizar
CREATE POLICY "Admin users can view contact leads" 
  ON public.contact_leads 
  FOR SELECT 
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admin users can update contact leads" 
  ON public.contact_leads 
  FOR UPDATE 
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admin users can view collaborator applications" 
  ON public.collaborator_applications 
  FOR SELECT 
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admin users can update collaborator applications" 
  ON public.collaborator_applications 
  FOR UPDATE 
  TO authenticated
  USING (public.current_user_is_admin());
