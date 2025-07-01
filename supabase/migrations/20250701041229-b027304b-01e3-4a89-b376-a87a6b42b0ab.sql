
-- Crear tabla para almacenar contactos enriquecidos de Apollo
CREATE TABLE public.apollo_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apollo_person_id TEXT,
  company_id UUID REFERENCES public.apollo_companies(id),
  company_domain TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  title TEXT,
  seniority TEXT,
  department TEXT,
  is_decision_maker BOOLEAN DEFAULT false,
  contact_score INTEGER DEFAULT 0,
  apollo_data JSONB DEFAULT '{}'::jsonb,
  last_enriched TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_apollo_contacts_company_id ON apollo_contacts(company_id);
CREATE INDEX idx_apollo_contacts_domain ON apollo_contacts(company_domain);
CREATE INDEX idx_apollo_contacts_email ON apollo_contacts(email);
CREATE INDEX idx_apollo_contacts_decision_maker ON apollo_contacts(is_decision_maker);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_apollo_contacts_updated_at
  BEFORE UPDATE ON apollo_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE public.apollo_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view apollo_contacts" ON public.apollo_contacts
  FOR SELECT USING (public.current_user_is_admin());

CREATE POLICY "Admin can manage apollo_contacts" ON public.apollo_contacts
  FOR ALL USING (public.current_user_is_admin());

-- Añadir columna para tracking de contactos en apollo_companies
ALTER TABLE public.apollo_companies 
ADD COLUMN IF NOT EXISTS contacts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS decision_makers_count INTEGER DEFAULT 0;
