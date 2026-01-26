-- Tabla para compradores potenciales vinculados a leads
CREATE TABLE public.lead_potential_buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  lead_origin TEXT NOT NULL,
  
  -- Datos del comprador
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  sector_focus TEXT[],
  revenue_range TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Gestión
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'identificado' CHECK (status IN ('identificado', 'contactado', 'interesado', 'negociando', 'descartado')),
  notes TEXT,
  
  -- Auditoría
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para búsquedas por lead
CREATE INDEX idx_lead_potential_buyers_lead ON lead_potential_buyers(lead_id, lead_origin);

-- Habilitar RLS
ALTER TABLE lead_potential_buyers ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados (admins)
CREATE POLICY "Authenticated users can manage potential buyers"
  ON lead_potential_buyers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_lead_potential_buyers_updated_at
  BEFORE UPDATE ON lead_potential_buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();