
-- Crear tabla para almacenar todas las valoraciones realizadas
CREATE TABLE public.company_valuations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información básica (Paso 1)
  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  cif TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  industry TEXT NOT NULL,
  years_of_operation INTEGER,
  employee_range TEXT NOT NULL,
  
  -- Datos financieros (Paso 2)
  revenue DECIMAL(15,2),
  ebitda DECIMAL(15,2),
  net_profit_margin DECIMAL(5,2),
  growth_rate DECIMAL(5,2),
  
  -- Características (Paso 3)
  location TEXT,
  ownership_participation TEXT,
  competitive_advantage TEXT,
  
  -- Resultado de la valoración
  final_valuation DECIMAL(15,2),
  ebitda_multiple_used DECIMAL(4,2),
  valuation_range_min DECIMAL(15,2),
  valuation_range_max DECIMAL(15,2),
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  
  -- Estado de envíos
  email_sent BOOLEAN DEFAULT false,
  whatsapp_sent BOOLEAN DEFAULT false,
  hubspot_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  hubspot_sent_at TIMESTAMP WITH TIME ZONE
);

-- Crear índices para mejorar las consultas
CREATE INDEX idx_company_valuations_email ON public.company_valuations(email);
CREATE INDEX idx_company_valuations_industry ON public.company_valuations(industry);
CREATE INDEX idx_company_valuations_created_at ON public.company_valuations(created_at);
CREATE INDEX idx_company_valuations_company_name ON public.company_valuations(company_name);

-- No necesitamos RLS ya que es una tabla pública para recopilar leads
-- Los datos serán insertados sin autenticación
