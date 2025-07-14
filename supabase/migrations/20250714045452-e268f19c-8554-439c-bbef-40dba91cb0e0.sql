-- Crear tabla newsletter_subscribers
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  company TEXT,
  interests TEXT[] DEFAULT '{}',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'website',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view newsletter subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (current_user_is_admin());

CREATE TRIGGER update_newsletter_subscribers_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar 8 posts adicionales de blog
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, tags, author_name, reading_time, is_published, is_featured, published_at) VALUES 
('Guía Completa de Due Diligence Financiera', 'due-diligence-financiera-ma', 'Todo sobre due diligence financiera en M&A', 'Contenido completo sobre due diligence...', 'M&A', '{"due diligence", "M&A"}', 'Equipo Capittal', 12, true, true, now()),
('Valoración de Empresas Tech', 'valoracion-empresas-tech', 'Metodologías para empresas tecnológicas', 'Análisis de valoración tech...', 'Valoración', '{"tecnología", "SaaS"}', 'Equipo Capittal', 15, true, false, now()),
('Healthcare: Oportunidades de Inversión', 'healthcare-oportunidades', 'Análisis del sector healthcare', 'Deep dive en healthcare...', 'Sectorial', '{"healthcare", "biotecnología"}', 'Equipo Capittal', 18, true, false, now()),
('Regulación y Compliance en M&A', 'regulacion-compliance-ma', 'Marco legal español en M&A', 'Guía regulatoria completa...', 'Regulación', '{"regulación", "compliance"}', 'Equipo Capittal', 20, true, false, now()),
('ESG y Sostenibilidad Empresarial', 'esg-sostenibilidad', 'Factores ESG en valoración', 'Impacto ESG en valoración...', 'ESG', '{"ESG", "sostenibilidad"}', 'Equipo Capittal', 22, true, true, now()),
('Private Equity en España', 'private-equity-espana', 'Estrategias de PE español', 'Análisis del mercado PE...', 'Private Equity', '{"private equity", "España"}', 'Equipo Capittal', 25, true, false, now()),
('IA en M&A', 'ia-ma-automation', 'Inteligencia artificial en M&A', 'Transformación digital M&A...', 'Tecnología', '{"IA", "automatización"}', 'Equipo Capittal', 20, true, false, now()),
('Mercados Emergentes LATAM', 'mercados-emergentes-latam', 'Oportunidades en Latinoamérica', 'Inversión en LATAM...', 'Mercados Emergentes', '{"LATAM", "emergentes"}', 'Equipo Capittal', 28, true, false, now());

-- Insertar 6 casos de estudio adicionales
INSERT INTO public.case_studies (title, description, sector, highlights, value_amount, value_currency, year, company_size, is_featured) VALUES 
('TechHealth Solutions', 'Adquisición de plataforma de telemedicina líder', 'Healthcare Technology', '{"Valoración 12x ARR", "Due diligence tecnológica", "Estructuración fiscal optimizada"}', 45000000, '€', 2023, 'Mid-Market', true),
('Retail Chains Europeas', 'Fusión transfronteriza de cadenas retail', 'Retail & Consumer', '{"Sinergias €25M anuales", "5 jurisdicciones", "95% retención management"}', 180000000, '€', 2022, 'Large-Cap', false),
('Industrial Division Carve-out', 'Spin-off de división industrial', 'Industrial Manufacturing', '{"25 plantas separadas", "1200+ contratos", "IPO exitosa 18 meses"}', 320000000, '€', 2023, 'Large-Cap', true),
('Cross-Border FinTech', 'Adquisición fintech latinoamericana', 'Financial Technology', '{"Valoración basada en CAC", "Due diligence 3 países", "Earn-out ligado a KPIs"}', 75000000, '€', 2023, 'Growth-Stage', false),
('Family Business Succession', 'Transición generacional empresa familiar', 'Food & Beverage', '{"Holding 3 generaciones", "Marca centenaria", "Ahorro fiscal €12M"}', 95000000, '€', 2022, 'Mid-Market', false),
('PE Buy-and-Build Strategy', 'Estrategia buy-and-build private equity', 'Business Services', '{"Platform + 4 add-ons", "Líder regional 12 oficinas", "Exit múltiple 2.8x"}', 140000000, '€', 2023, 'Mid-Market', true);