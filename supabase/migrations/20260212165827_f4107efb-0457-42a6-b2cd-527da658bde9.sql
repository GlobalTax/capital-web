
-- =============================================
-- Valuation Campaigns: Campañas de valoración masiva outbound
-- =============================================

-- 1. Tabla principal de campañas
CREATE TABLE public.valuation_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id),

  name text NOT NULL,
  sector text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'paused')),

  custom_multiple numeric,
  multiple_low numeric,
  multiple_high numeric,
  valuation_context text,
  strengths_template text,
  weaknesses_template text,
  comparables_text text,
  include_comparables boolean DEFAULT false,
  ai_personalize boolean DEFAULT false,

  advisor_name text,
  advisor_email text,
  advisor_phone text,
  advisor_role text,
  use_custom_advisor boolean DEFAULT false,

  lead_source text DEFAULT 'Outbound',
  service_type text DEFAULT 'vender',

  total_companies int DEFAULT 0,
  total_created int DEFAULT 0,
  total_sent int DEFAULT 0,
  total_errors int DEFAULT 0,
  total_valuation numeric DEFAULT 0
);

-- 2. Tabla de empresas por campaña
CREATE TABLE public.valuation_campaign_companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.valuation_campaigns(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,

  client_company text NOT NULL,
  client_name text,
  client_email text,
  client_phone text,
  client_cif text,

  revenue numeric,
  ebitda numeric NOT NULL,
  financial_year int DEFAULT 2024,

  ai_strengths text,
  ai_weaknesses text,
  ai_context text,
  ai_enriched boolean DEFAULT false,

  custom_multiple numeric,

  valuation_low numeric,
  valuation_central numeric,
  valuation_high numeric,
  normalized_ebitda numeric,
  multiple_used numeric,

  status text DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'created', 'sent', 'failed', 'excluded')),
  error_message text,

  professional_valuation_id uuid REFERENCES public.professional_valuations(id),

  source text DEFAULT 'manual',
  excel_row_number int
);

-- 3. Índices
CREATE INDEX idx_valuation_campaigns_status ON public.valuation_campaigns(status);
CREATE INDEX idx_valuation_campaigns_created_by ON public.valuation_campaigns(created_by);
CREATE INDEX idx_vc_companies_campaign ON public.valuation_campaign_companies(campaign_id);
CREATE INDEX idx_vc_companies_status ON public.valuation_campaign_companies(status);

-- 4. RLS
ALTER TABLE public.valuation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuation_campaign_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage valuation campaigns"
ON public.valuation_campaigns FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage valuation campaign companies"
ON public.valuation_campaign_companies FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Trigger updated_at
CREATE TRIGGER update_valuation_campaigns_updated_at
  BEFORE UPDATE ON public.valuation_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Sidebar entry under GESTIONAR DATOS section
INSERT INTO public.sidebar_items (section_id, title, url, icon, position, is_active)
VALUES (
  '977b2721-6351-4714-b58c-8a5c5aa7d7d9',
  'Campañas Outbound',
  '/admin/campanas-valoracion',
  'Megaphone',
  99,
  true
);
