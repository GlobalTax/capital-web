-- =============================================
-- MÓDULO SEARCH FUNDS INTELLIGENCE & MATCHING
-- =============================================

-- 1. TABLA sf_funds - Directorio de Search Funds
CREATE TABLE public.sf_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  country_base TEXT,
  cities TEXT[],
  status TEXT CHECK (status IN ('searching', 'acquired', 'holding', 'exited', 'inactive')) DEFAULT 'searching',
  founded_year INT,
  description TEXT,
  geography_focus TEXT[],
  sector_focus TEXT[],
  sector_exclusions TEXT[],
  deal_size_min NUMERIC,
  deal_size_max NUMERIC,
  ebitda_min NUMERIC,
  ebitda_max NUMERIC,
  revenue_min NUMERIC,
  revenue_max NUMERIC,
  investment_style TEXT CHECK (investment_style IN ('single', 'buy_and_build', 'either')) DEFAULT 'single',
  notes_internal TEXT,
  source_url TEXT,
  source_last_verified_at TIMESTAMPTZ,
  searcher_lead_id UUID REFERENCES public.searcher_leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para sf_funds
CREATE INDEX idx_sf_funds_status ON public.sf_funds(status);
CREATE INDEX idx_sf_funds_country_base ON public.sf_funds(country_base);
CREATE INDEX idx_sf_funds_geography_focus ON public.sf_funds USING GIN(geography_focus);
CREATE INDEX idx_sf_funds_sector_focus ON public.sf_funds USING GIN(sector_focus);

-- 2. TABLA sf_people - Contactos del Fund
CREATE TABLE public.sf_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.sf_funds(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('searcher', 'partner', 'principal', 'advisor')) DEFAULT 'searcher',
  email TEXT,
  linkedin_url TEXT,
  phone TEXT,
  location TEXT,
  school TEXT,
  languages TEXT[],
  is_primary_contact BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para sf_people
CREATE INDEX idx_sf_people_fund_id ON public.sf_people(fund_id);
CREATE INDEX idx_sf_people_role ON public.sf_people(role);
CREATE INDEX idx_sf_people_email ON public.sf_people(email);

-- 3. TABLA sf_backers - Inversores/Sponsors
CREATE TABLE public.sf_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('fund', 'family_office', 'angel', 'bank', 'accelerator', 'other')) DEFAULT 'fund',
  website TEXT,
  country TEXT,
  logo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para sf_backers
CREATE INDEX idx_sf_backers_type ON public.sf_backers(type);
CREATE INDEX idx_sf_backers_country ON public.sf_backers(country);

-- 4. TABLA sf_fund_backers - Relación M:N
CREATE TABLE public.sf_fund_backers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.sf_funds(id) ON DELETE CASCADE,
  backer_id UUID NOT NULL REFERENCES public.sf_backers(id) ON DELETE CASCADE,
  support_type TEXT CHECK (support_type IN ('search_capital', 'acquisition_coinvest', 'both', 'unknown')) DEFAULT 'unknown',
  since_year INT,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  source_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(fund_id, backer_id)
);

-- Índices para sf_fund_backers
CREATE INDEX idx_sf_fund_backers_fund_id ON public.sf_fund_backers(fund_id);
CREATE INDEX idx_sf_fund_backers_backer_id ON public.sf_fund_backers(backer_id);

-- 5. TABLA sf_acquisitions - Portfolio de adquisiciones
CREATE TABLE public.sf_acquisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.sf_funds(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  country TEXT,
  region TEXT,
  sector TEXT,
  cnae TEXT,
  description TEXT,
  deal_year INT,
  deal_type TEXT CHECK (deal_type IN ('majority', 'minority', 'merger', 'asset', 'unknown')) DEFAULT 'majority',
  status TEXT CHECK (status IN ('owned', 'exited', 'unknown')) DEFAULT 'owned',
  exit_year INT,
  source_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para sf_acquisitions
CREATE INDEX idx_sf_acquisitions_fund_id ON public.sf_acquisitions(fund_id);
CREATE INDEX idx_sf_acquisitions_sector ON public.sf_acquisitions(sector);
CREATE INDEX idx_sf_acquisitions_country ON public.sf_acquisitions(country);
CREATE INDEX idx_sf_acquisitions_deal_year ON public.sf_acquisitions(deal_year);

-- 6. TABLA sf_matches - Sistema de Matching con CRM
CREATE TABLE public.sf_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.sf_funds(id) ON DELETE CASCADE,
  crm_entity_type TEXT CHECK (crm_entity_type IN ('operation', 'mandato')) NOT NULL,
  crm_entity_id UUID NOT NULL,
  match_score INT CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('new', 'reviewed', 'contacted', 'not_fit', 'won')) DEFAULT 'new',
  owner_user_id UUID,
  last_scored_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(fund_id, crm_entity_type, crm_entity_id)
);

-- Índices para sf_matches
CREATE INDEX idx_sf_matches_fund_id ON public.sf_matches(fund_id);
CREATE INDEX idx_sf_matches_crm_entity ON public.sf_matches(crm_entity_type, crm_entity_id);
CREATE INDEX idx_sf_matches_status ON public.sf_matches(status);
CREATE INDEX idx_sf_matches_score ON public.sf_matches(match_score DESC);

-- 7. TABLA sf_outreach - Log de Actividad/Outreach
CREATE TABLE public.sf_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.sf_funds(id) ON DELETE CASCADE,
  crm_entity_type TEXT CHECK (crm_entity_type IN ('operation', 'mandato')),
  crm_entity_id UUID,
  person_id UUID REFERENCES public.sf_people(id) ON DELETE SET NULL,
  channel TEXT CHECK (channel IN ('email', 'linkedin', 'call', 'whatsapp', 'other')) NOT NULL,
  template_key TEXT,
  subject TEXT,
  message_preview TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'sent', 'replied', 'bounced', 'closed')) DEFAULT 'draft',
  notes TEXT,
  external_thread_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para sf_outreach
CREATE INDEX idx_sf_outreach_fund_id ON public.sf_outreach(fund_id);
CREATE INDEX idx_sf_outreach_person_id ON public.sf_outreach(person_id);
CREATE INDEX idx_sf_outreach_status ON public.sf_outreach(status);
CREATE INDEX idx_sf_outreach_channel ON public.sf_outreach(channel);

-- =============================================
-- TRIGGERS PARA updated_at
-- =============================================

CREATE TRIGGER update_sf_funds_updated_at
  BEFORE UPDATE ON public.sf_funds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sf_people_updated_at
  BEFORE UPDATE ON public.sf_people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sf_backers_updated_at
  BEFORE UPDATE ON public.sf_backers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sf_acquisitions_updated_at
  BEFORE UPDATE ON public.sf_acquisitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sf_matches_updated_at
  BEFORE UPDATE ON public.sf_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sf_outreach_updated_at
  BEFORE UPDATE ON public.sf_outreach
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- sf_funds
ALTER TABLE public.sf_funds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sf_funds"
  ON public.sf_funds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sf_funds"
  ON public.sf_funds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sf_funds"
  ON public.sf_funds FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sf_funds"
  ON public.sf_funds FOR DELETE
  TO authenticated
  USING (true);

-- sf_people
ALTER TABLE public.sf_people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sf_people"
  ON public.sf_people FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sf_people"
  ON public.sf_people FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sf_people"
  ON public.sf_people FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sf_people"
  ON public.sf_people FOR DELETE
  TO authenticated
  USING (true);

-- sf_backers
ALTER TABLE public.sf_backers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sf_backers"
  ON public.sf_backers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sf_backers"
  ON public.sf_backers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sf_backers"
  ON public.sf_backers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sf_backers"
  ON public.sf_backers FOR DELETE
  TO authenticated
  USING (true);

-- sf_fund_backers
ALTER TABLE public.sf_fund_backers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sf_fund_backers"
  ON public.sf_fund_backers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sf_fund_backers"
  ON public.sf_fund_backers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sf_fund_backers"
  ON public.sf_fund_backers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sf_fund_backers"
  ON public.sf_fund_backers FOR DELETE
  TO authenticated
  USING (true);

-- sf_acquisitions
ALTER TABLE public.sf_acquisitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sf_acquisitions"
  ON public.sf_acquisitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sf_acquisitions"
  ON public.sf_acquisitions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sf_acquisitions"
  ON public.sf_acquisitions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sf_acquisitions"
  ON public.sf_acquisitions FOR DELETE
  TO authenticated
  USING (true);

-- sf_matches
ALTER TABLE public.sf_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sf_matches"
  ON public.sf_matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sf_matches"
  ON public.sf_matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sf_matches"
  ON public.sf_matches FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sf_matches"
  ON public.sf_matches FOR DELETE
  TO authenticated
  USING (true);

-- sf_outreach
ALTER TABLE public.sf_outreach ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sf_outreach"
  ON public.sf_outreach FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sf_outreach"
  ON public.sf_outreach FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sf_outreach"
  ON public.sf_outreach FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sf_outreach"
  ON public.sf_outreach FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- SEED DATA - 5 Search Funds de ejemplo
-- =============================================

INSERT INTO public.sf_funds (name, website, country_base, cities, status, founded_year, description, geography_focus, sector_focus, sector_exclusions, ebitda_min, ebitda_max, revenue_min, revenue_max, investment_style) VALUES
('Iberia Search Fund', 'https://iberiasf.com', 'Spain', ARRAY['Barcelona', 'Madrid'], 'searching', 2023, 'Search fund enfocado en servicios B2B en la Península Ibérica', ARRAY['Spain', 'Portugal'], ARRAY['Servicios B2B', 'IT Services', 'Consultoría'], ARRAY['Real Estate', 'Retail'], 500000, 3000000, 2000000, 15000000, 'single'),
('Norte Capital Search', 'https://nortecapital.es', 'Spain', ARRAY['Bilbao', 'San Sebastián'], 'searching', 2022, 'Búsqueda de empresas industriales en el norte de España', ARRAY['Spain', 'Basque Country'], ARRAY['Industrial', 'Manufactura', 'Componentes'], ARRAY['Hostelería'], 800000, 5000000, 5000000, 30000000, 'buy_and_build'),
('Levante Partners SF', 'https://levantepartners.com', 'Spain', ARRAY['Valencia', 'Alicante'], 'searching', 2024, 'Search fund tecnológico en la Comunidad Valenciana', ARRAY['Spain', 'Valencia Region'], ARRAY['SaaS', 'Tech Services', 'Software'], ARRAY['Hardware', 'Telecom'], 300000, 2000000, 1000000, 10000000, 'single'),
('Atlantic Equity Search', 'https://atlanticequity.es', 'Spain', ARRAY['Madrid'], 'acquired', 2021, 'Search fund especializado en healthcare y pharma services', ARRAY['Spain', 'EU'], ARRAY['Healthcare', 'Pharma Services', 'Medical Devices'], ARRAY['Biotech R&D'], 1000000, 8000000, 5000000, 40000000, 'either'),
('Cantabria Growth SF', 'https://cantabriagrowth.com', 'Spain', ARRAY['Santander', 'Torrelavega'], 'searching', 2023, 'Enfocado en alimentación y agroindustria', ARRAY['Spain', 'Cantabria', 'Asturias'], ARRAY['Alimentación', 'Agroindustria', 'F&B'], ARRAY['Pesca'], 400000, 2500000, 2000000, 12000000, 'single');

-- =============================================
-- SEED DATA - 5 Backers de ejemplo
-- =============================================

INSERT INTO public.sf_backers (name, type, website, country, notes) VALUES
('Istria Partners', 'fund', 'https://istriapartners.com', 'Spain', 'Uno de los principales backers de search funds en España'),
('JB46 Capital', 'fund', 'https://jb46capital.com', 'Spain', 'Family office con experiencia en search funds'),
('Arada Capital', 'fund', 'https://aradacapital.com', 'Spain', 'Inversor especializado en search funds ibéricos'),
('Search Fund Accelerator', 'accelerator', 'https://sfaccelerator.com', 'USA', 'Programa de aceleración para searchers'),
('IESE Alumni Fund', 'fund', 'https://alumni.iese.edu', 'Spain', 'Fondo de alumni de IESE para search funds');

-- =============================================
-- SEED DATA - Relaciones Fund-Backers
-- =============================================

INSERT INTO public.sf_fund_backers (fund_id, backer_id, support_type, since_year, confidence_level)
SELECT f.id, b.id, 'both', 2023, 'high'
FROM public.sf_funds f, public.sf_backers b
WHERE f.name = 'Iberia Search Fund' AND b.name = 'Istria Partners';

INSERT INTO public.sf_fund_backers (fund_id, backer_id, support_type, since_year, confidence_level)
SELECT f.id, b.id, 'search_capital', 2022, 'high'
FROM public.sf_funds f, public.sf_backers b
WHERE f.name = 'Norte Capital Search' AND b.name = 'JB46 Capital';

INSERT INTO public.sf_fund_backers (fund_id, backer_id, support_type, since_year, confidence_level)
SELECT f.id, b.id, 'both', 2024, 'medium'
FROM public.sf_funds f, public.sf_backers b
WHERE f.name = 'Levante Partners SF' AND b.name = 'Arada Capital';

INSERT INTO public.sf_fund_backers (fund_id, backer_id, support_type, since_year, confidence_level)
SELECT f.id, b.id, 'acquisition_coinvest', 2021, 'high'
FROM public.sf_funds f, public.sf_backers b
WHERE f.name = 'Atlantic Equity Search' AND b.name = 'IESE Alumni Fund';

INSERT INTO public.sf_fund_backers (fund_id, backer_id, support_type, since_year, confidence_level)
SELECT f.id, b.id, 'search_capital', 2023, 'medium'
FROM public.sf_funds f, public.sf_backers b
WHERE f.name = 'Cantabria Growth SF' AND b.name = 'Search Fund Accelerator';

-- =============================================
-- SEED DATA - 5 Adquisiciones de ejemplo
-- =============================================

INSERT INTO public.sf_acquisitions (fund_id, company_name, country, region, sector, deal_year, deal_type, status, description)
SELECT f.id, 'TechConsult Barcelona SL', 'Spain', 'Cataluña', 'IT Services', 2024, 'majority', 'owned', 'Consultora tecnológica con 25 empleados'
FROM public.sf_funds f WHERE f.name = 'Atlantic Equity Search';

INSERT INTO public.sf_acquisitions (fund_id, company_name, country, region, sector, deal_year, deal_type, status, description)
SELECT f.id, 'MediLab Services SA', 'Spain', 'Madrid', 'Healthcare', 2023, 'majority', 'owned', 'Laboratorio de análisis clínicos'
FROM public.sf_funds f WHERE f.name = 'Atlantic Equity Search';

INSERT INTO public.sf_acquisitions (fund_id, company_name, country, region, sector, deal_year, deal_type, status, description)
SELECT f.id, 'Componentes Industriales Norte SL', 'Spain', 'País Vasco', 'Industrial', 2023, 'majority', 'owned', 'Fabricante de componentes para automoción'
FROM public.sf_funds f WHERE f.name = 'Norte Capital Search';

-- =============================================
-- SEED DATA - Contactos de ejemplo
-- =============================================

INSERT INTO public.sf_people (fund_id, full_name, role, email, linkedin_url, location, school, languages, is_primary_contact)
SELECT f.id, 'Carlos Martínez', 'searcher', 'carlos@iberiasf.com', 'https://linkedin.com/in/carlosmartinez', 'Barcelona', 'IESE Business School', ARRAY['Spanish', 'English', 'Catalan'], true
FROM public.sf_funds f WHERE f.name = 'Iberia Search Fund';

INSERT INTO public.sf_people (fund_id, full_name, role, email, linkedin_url, location, school, languages, is_primary_contact)
SELECT f.id, 'Ana García', 'searcher', 'ana@nortecapital.es', 'https://linkedin.com/in/anagarcia', 'Bilbao', 'ESADE', ARRAY['Spanish', 'English', 'Basque'], true
FROM public.sf_funds f WHERE f.name = 'Norte Capital Search';

INSERT INTO public.sf_people (fund_id, full_name, role, email, linkedin_url, location, school, languages, is_primary_contact)
SELECT f.id, 'Pablo López', 'searcher', 'pablo@levantepartners.com', 'https://linkedin.com/in/pablolopez', 'Valencia', 'IE Business School', ARRAY['Spanish', 'English'], true
FROM public.sf_funds f WHERE f.name = 'Levante Partners SF';

INSERT INTO public.sf_people (fund_id, full_name, role, email, linkedin_url, location, school, languages, is_primary_contact)
SELECT f.id, 'María Fernández', 'partner', 'maria@atlanticequity.es', 'https://linkedin.com/in/mariafernandez', 'Madrid', 'Stanford GSB', ARRAY['Spanish', 'English', 'French'], true
FROM public.sf_funds f WHERE f.name = 'Atlantic Equity Search';

INSERT INTO public.sf_people (fund_id, full_name, role, email, linkedin_url, location, school, languages, is_primary_contact)
SELECT f.id, 'Javier Ruiz', 'searcher', 'javier@cantabriagrowth.com', 'https://linkedin.com/in/javierruiz', 'Santander', 'IESE Business School', ARRAY['Spanish', 'English'], true
FROM public.sf_funds f WHERE f.name = 'Cantabria Growth SF';