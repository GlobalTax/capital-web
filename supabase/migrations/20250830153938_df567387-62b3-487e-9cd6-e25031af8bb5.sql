-- Create sector calculators table for managing different calculators
CREATE TABLE public.sector_calculators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  fields_config JSONB DEFAULT '[]',
  results_config JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create calculator results table for analytics
CREATE TABLE public.calculator_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_id UUID REFERENCES public.sector_calculators(id),
  session_id TEXT,
  visitor_id TEXT,
  input_data JSONB NOT NULL DEFAULT '{}',
  calculation_results JSONB NOT NULL DEFAULT '{}',
  valuation_amount NUMERIC,
  sector TEXT NOT NULL,
  company_name TEXT,
  contact_email TEXT,
  lead_captured BOOLEAN DEFAULT false,
  report_generated BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sector report templates table
CREATE TABLE public.sector_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT DEFAULT 'comprehensive',
  content_structure JSONB DEFAULT '{}',
  ai_prompt_template TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Enable RLS on all tables
ALTER TABLE public.sector_calculators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculator_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_report_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sector_calculators
CREATE POLICY "Anyone can view active calculators" 
ON public.sector_calculators FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage calculators" 
ON public.sector_calculators FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- RLS Policies for calculator_results
CREATE POLICY "Admins can view all calculator results" 
ON public.calculator_results FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "Secure calculator results insert" 
ON public.calculator_results FOR INSERT 
WITH CHECK (
  sector IS NOT NULL AND 
  input_data IS NOT NULL AND 
  calculation_results IS NOT NULL AND
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'calculator_result', 
    5, 
    60
  )
);

-- RLS Policies for sector_report_templates
CREATE POLICY "Anyone can view active templates" 
ON public.sector_report_templates FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage templates" 
ON public.sector_report_templates FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sector_calculators_updated_at
  BEFORE UPDATE ON public.sector_calculators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sector_report_templates_updated_at
  BEFORE UPDATE ON public.sector_report_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial sector calculators
INSERT INTO public.sector_calculators (name, sector, slug, description, configuration, fields_config, results_config, display_order) VALUES
(
  'Calculadora Tech/SaaS',
  'Tecnología',
  'tech-saas',
  'Valoración especializada para empresas de tecnología y SaaS con métricas específicas del sector',
  '{"industry_type": "tech", "focus_metrics": ["mrr", "arr", "churn_rate", "ltv_cac"], "multiplier_range": {"min": 3, "max": 15}}',
  '[
    {"name": "monthly_recurring_revenue", "label": "MRR (€/mes)", "type": "number", "required": true, "category": "financials"},
    {"name": "annual_recurring_revenue", "label": "ARR (€/año)", "type": "number", "required": true, "category": "financials"},
    {"name": "churn_rate", "label": "Tasa de Churn (%)", "type": "number", "required": true, "category": "metrics", "max": 100},
    {"name": "customer_acquisition_cost", "label": "CAC (€)", "type": "number", "required": true, "category": "metrics"},
    {"name": "lifetime_value", "label": "LTV (€)", "type": "number", "required": true, "category": "metrics"},
    {"name": "growth_rate", "label": "Crecimiento Anual (%)", "type": "number", "required": true, "category": "growth"},
    {"name": "team_size", "label": "Tamaño del Equipo", "type": "select", "options": ["1-5", "6-15", "16-50", "51-100", "100+"], "category": "company"}
  ]',
  '{"base_multiplier": 8, "adjustments": {"high_growth": 1.5, "low_churn": 1.3, "good_ltv_cac": 1.2}}',
  1
),
(
  'Calculadora Salud',
  'Salud',
  'salud',
  'Valoración para empresas del sector sanitario y healthtech',
  '{"industry_type": "health", "focus_metrics": ["patient_volume", "revenue_per_patient", "regulatory_compliance"], "multiplier_range": {"min": 4, "max": 12}}',
  '[
    {"name": "patient_volume", "label": "Volumen de Pacientes/Mes", "type": "number", "required": true, "category": "operations"},
    {"name": "revenue_per_patient", "label": "Ingresos por Paciente (€)", "type": "number", "required": true, "category": "financials"},
    {"name": "regulatory_certifications", "label": "Certificaciones", "type": "multiselect", "options": ["ISO 13485", "CE Marking", "FDA", "AEMPS", "Otros"], "category": "compliance"},
    {"name": "service_type", "label": "Tipo de Servicio", "type": "select", "options": ["Telemedicina", "Diagnóstico", "Tratamiento", "Prevención", "Rehabilitación"], "category": "services"},
    {"name": "geographic_coverage", "label": "Cobertura Geográfica", "type": "select", "options": ["Local", "Regional", "Nacional", "Internacional"], "category": "market"}
  ]',
  '{"base_multiplier": 7, "adjustments": {"certified": 1.4, "high_patient_volume": 1.3, "telemedicine": 1.2}}',
  2
),
(
  'Calculadora Retail',
  'Retail',
  'retail',
  'Valoración para empresas de comercio minorista y e-commerce',
  '{"industry_type": "retail", "focus_metrics": ["inventory_turnover", "gross_margin", "customer_frequency"], "multiplier_range": {"min": 2, "max": 8}}',
  '[
    {"name": "gross_margin", "label": "Margen Bruto (%)", "type": "number", "required": true, "category": "financials", "max": 100},
    {"name": "inventory_turnover", "label": "Rotación de Inventario", "type": "number", "required": true, "category": "operations"},
    {"name": "avg_transaction_value", "label": "Ticket Medio (€)", "type": "number", "required": true, "category": "sales"},
    {"name": "customer_frequency", "label": "Frecuencia de Compra/Año", "type": "number", "required": true, "category": "customer"},
    {"name": "channel_mix", "label": "Canales de Venta", "type": "multiselect", "options": ["Físico", "Online", "Marketplace", "B2B", "B2C"], "category": "channels"},
    {"name": "seasonal_variance", "label": "Variación Estacional (%)", "type": "number", "category": "risk", "max": 100}
  ]',
  '{"base_multiplier": 4, "adjustments": {"high_margin": 1.3, "omnichannel": 1.2, "high_turnover": 1.25}}',
  3
);

-- Insert sector report templates
INSERT INTO public.sector_report_templates (sector, template_name, template_type, content_structure, ai_prompt_template) VALUES
(
  'Tecnología',
  'Reporte Tech/SaaS Completo',
  'comprehensive',
  '{"sections": ["executive_summary", "market_analysis", "financial_metrics", "tech_trends", "valuation_analysis", "growth_opportunities", "risk_assessment"]}',
  'Genera un reporte completo de valoración para una empresa Tech/SaaS con los siguientes datos: {input_data}. Incluye análisis de métricas SaaS (MRR, ARR, Churn, LTV/CAC), tendencias del sector tecnológico, comparables de mercado y recomendaciones estratégicas específicas para el crecimiento en el sector tech.'
),
(
  'Salud',
  'Reporte Sector Salud',
  'comprehensive', 
  '{"sections": ["executive_summary", "regulatory_landscape", "market_position", "operational_metrics", "valuation_analysis", "compliance_assessment", "growth_strategy"]}',
  'Genera un reporte de valoración para una empresa del sector salud con estos datos: {input_data}. Analiza el cumplimiento regulatorio, métricas operacionales específicas de salud, posicionamiento en el mercado sanitario, y oportunidades de crecimiento considerando las tendencias del sector salud y healthtech.'
),
(
  'Retail',
  'Reporte Retail y E-commerce',
  'comprehensive',
  '{"sections": ["executive_summary", "market_analysis", "operational_efficiency", "customer_analytics", "channel_performance", "valuation_analysis", "digital_transformation"]}',
  'Crea un reporte de valoración para una empresa retail con los datos: {input_data}. Incluye análisis de eficiencia operacional, métricas de cliente, rendimiento por canales, análisis de inventario, y estrategias de transformación digital específicas para el sector retail.'
);