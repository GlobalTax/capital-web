
-- Tabla para almacenar datos enriquecidos de Apollo
CREATE TABLE public.apollo_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_domain TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  employee_count INTEGER,
  industry TEXT,
  revenue_range TEXT,
  location TEXT,
  founded_year INTEGER,
  technologies TEXT[],
  is_target_account BOOLEAN DEFAULT false,
  apollo_id TEXT,
  last_enriched TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para tracking de conversiones de Google Ads
CREATE TABLE public.ad_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gclid TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC DEFAULT 0,
  conversion_name TEXT,
  visitor_id TEXT,
  company_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para inteligencia de LinkedIn
CREATE TABLE public.linkedin_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_domain TEXT NOT NULL,
  company_name TEXT NOT NULL,
  recent_hires INTEGER DEFAULT 0,
  growth_signals TEXT[],
  decision_makers JSONB DEFAULT '[]'::jsonb,
  company_updates TEXT[],
  funding_signals JSONB DEFAULT '{}'::jsonb,
  optimal_outreach_timing TEXT,
  confidence_score INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para attribution touchpoints avanzada
CREATE TABLE public.attribution_touchpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  company_domain TEXT,
  touchpoint_order INTEGER NOT NULL,
  channel TEXT NOT NULL,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  content TEXT,
  page_path TEXT,
  attribution_weight NUMERIC DEFAULT 0,
  conversion_value NUMERIC DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para logs de integraciones
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_type TEXT NOT NULL, -- 'apollo', 'google_ads', 'linkedin', etc.
  operation TEXT NOT NULL, -- 'sync', 'enrich', 'update', etc.
  company_domain TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
  data_payload JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para configuración de integraciones
CREATE TABLE public.integration_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_frequency_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para actualizar updated_at en apollo_companies
CREATE TRIGGER update_apollo_companies_updated_at
  BEFORE UPDATE ON apollo_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en integration_configs
CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON integration_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies para las nuevas tablas
ALTER TABLE public.apollo_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (solo admin puede ver/modificar)
CREATE POLICY "Admin can view apollo_companies" ON public.apollo_companies
  FOR SELECT USING (public.current_user_is_admin());

CREATE POLICY "Admin can manage apollo_companies" ON public.apollo_companies
  FOR ALL USING (public.current_user_is_admin());

CREATE POLICY "Admin can view ad_conversions" ON public.ad_conversions
  FOR SELECT USING (public.current_user_is_admin());

CREATE POLICY "Admin can manage ad_conversions" ON public.ad_conversions
  FOR ALL USING (public.current_user_is_admin());

CREATE POLICY "Admin can view linkedin_intelligence" ON public.linkedin_intelligence
  FOR SELECT USING (public.current_user_is_admin());

CREATE POLICY "Admin can manage linkedin_intelligence" ON public.linkedin_intelligence
  FOR ALL USING (public.current_user_is_admin());

CREATE POLICY "Admin can view attribution_touchpoints" ON public.attribution_touchpoints
  FOR SELECT USING (public.current_user_is_admin());

CREATE POLICY "Admin can manage attribution_touchpoints" ON public.attribution_touchpoints
  FOR ALL USING (public.current_user_is_admin());

CREATE POLICY "Admin can view integration_logs" ON public.integration_logs
  FOR SELECT USING (public.current_user_is_admin());

CREATE POLICY "Admin can manage integration_logs" ON public.integration_logs
  FOR ALL USING (public.current_user_is_admin());

CREATE POLICY "Admin can view integration_configs" ON public.integration_configs
  FOR SELECT USING (public.current_user_is_admin());

CREATE POLICY "Admin can manage integration_configs" ON public.integration_configs
  FOR ALL USING (public.current_user_is_admin());

-- Índices para optimizar consultas
CREATE INDEX idx_apollo_companies_domain ON apollo_companies(company_domain);
CREATE INDEX idx_ad_conversions_gclid ON ad_conversions(gclid);
CREATE INDEX idx_ad_conversions_visitor ON ad_conversions(visitor_id);
CREATE INDEX idx_linkedin_intelligence_domain ON linkedin_intelligence(company_domain);
CREATE INDEX idx_attribution_touchpoints_visitor ON attribution_touchpoints(visitor_id);
CREATE INDEX idx_integration_logs_type_status ON integration_logs(integration_type, status);
