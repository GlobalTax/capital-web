-- Fase 1: Esquema de Base de Datos para Calculadora Sector Seguridad

-- 1. Tabla para leads del sector seguridad (formulario público)
CREATE TABLE public.lead_security (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Datos básicos del formulario público
  cif TEXT,
  email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  
  -- Subtipo específico del sector seguridad
  security_subtype TEXT NOT NULL CHECK (security_subtype IN (
    'integrador_mantenimiento',
    'cra_monitorizacion', 
    'distribucion',
    'mixto'
  )),
  
  -- Bandas de métricas (rangos amplios para formulario rápido)
  revenue_band TEXT CHECK (revenue_band IN (
    '0-500k',
    '500k-1m',
    '1m-2m', 
    '2m-5m',
    '5m-10m',
    '10m+'
  )),
  
  ebitda_band TEXT CHECK (ebitda_band IN (
    '0-50k',
    '50k-100k',
    '100k-200k',
    '200k-500k', 
    '500k-1m',
    '1m+'
  )),
  
  -- Estado del workflow
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new',
    'needs_enrichment',
    'in_review', 
    'sent_refined',
    'qualified'
  )),
  
  -- Metadatos
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Tabla para valoración inicial rápida
CREATE TABLE public.lead_valuation_initial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_security_id UUID NOT NULL REFERENCES public.lead_security(id) ON DELETE CASCADE,
  
  -- Rangos de valoración conservadores
  ev_low NUMERIC NOT NULL,
  ev_base NUMERIC NOT NULL, 
  ev_high NUMERIC NOT NULL,
  
  -- Múltiples utilizados por subtipo
  ebitda_multiple_low NUMERIC NOT NULL,
  ebitda_multiple_base NUMERIC NOT NULL,
  ebitda_multiple_high NUMERIC NOT NULL,
  
  -- Assumptions y metodología
  calculation_method TEXT NOT NULL DEFAULT 'quick_sector_multiples',
  assumptions JSONB NOT NULL DEFAULT '{}',
  
  -- Scorecard factors (5 factores clave)
  scorecard_data JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Tabla para snapshots de enriquecimiento
CREATE TABLE public.lead_enrichment_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_security_id UUID NOT NULL REFERENCES public.lead_security(id) ON DELETE CASCADE,
  
  -- Fuente de enriquecimiento
  enrichment_source TEXT NOT NULL CHECK (enrichment_source IN (
    'einforma',
    'manual_research',
    'web_scraping',
    'admin_input'
  )),
  
  -- Datos enriquecidos
  enriched_data JSONB NOT NULL DEFAULT '{}',
  
  -- Metadatos del enriquecimiento
  enriched_by UUID REFERENCES auth.users(id),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Tabla para valoración refinada profesional
CREATE TABLE public.lead_valuation_refined (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_security_id UUID NOT NULL REFERENCES public.lead_security(id) ON DELETE CASCADE,
  
  -- Valoración refinada
  ev_final NUMERIC NOT NULL,
  ev_range_min NUMERIC NOT NULL,
  ev_range_max NUMERIC NOT NULL,
  
  -- Múltiples ajustados post-enriquecimiento
  ebitda_multiple_adjusted NUMERIC NOT NULL,
  adjustment_factors JSONB NOT NULL DEFAULT '{}',
  
  -- Análisis de sensibilidad
  sensitivity_analysis JSONB,
  
  -- Diferencias vs valoración inicial
  initial_vs_refined_diff NUMERIC,
  refinement_notes TEXT,
  
  -- PDF y presentación
  pdf_url TEXT,
  presentation_token TEXT UNIQUE,
  
  -- Aprobación
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.lead_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_valuation_initial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_enrichment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_valuation_refined ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lead_security
CREATE POLICY "Público puede insertar leads seguridad con rate limiting" 
ON public.lead_security 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'security_lead', 
    2, 
    1440
  ) AND
  contact_name IS NOT NULL AND 
  length(TRIM(contact_name)) >= 2 AND
  company_name IS NOT NULL AND
  length(TRIM(company_name)) >= 2 AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  security_subtype IS NOT NULL
);

CREATE POLICY "Admins pueden gestionar todos los leads seguridad" 
ON public.lead_security 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Políticas para valoración inicial
CREATE POLICY "Sistema puede crear valoraciones iniciales" 
ON public.lead_valuation_initial 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins pueden ver valoraciones iniciales" 
ON public.lead_valuation_initial 
FOR SELECT 
USING (current_user_is_admin());

-- Políticas para enriquecimiento
CREATE POLICY "Admins pueden gestionar enriquecimiento" 
ON public.lead_enrichment_snapshots 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Políticas para valoración refinada
CREATE POLICY "Admins pueden gestionar valoraciones refinadas" 
ON public.lead_valuation_refined 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Acceso público por token de presentación" 
ON public.lead_valuation_refined 
FOR SELECT 
USING (
  presentation_token IS NOT NULL AND 
  created_at > now() - INTERVAL '30 days'
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_lead_security_updated_at
  BEFORE UPDATE ON public.lead_security
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_valuation_refined_updated_at
  BEFORE UPDATE ON public.lead_valuation_refined
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para optimización
CREATE INDEX idx_lead_security_status ON public.lead_security(status);
CREATE INDEX idx_lead_security_subtype ON public.lead_security(security_subtype);
CREATE INDEX idx_lead_security_created_at ON public.lead_security(created_at DESC);
CREATE INDEX idx_lead_valuation_refined_token ON public.lead_valuation_refined(presentation_token) WHERE presentation_token IS NOT NULL;