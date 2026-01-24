-- =====================================================
-- TopBar Configuration System
-- =====================================================

-- Table 1: General TopBar configuration (singleton)
CREATE TABLE public.topbar_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL DEFAULT '695 717 490',
  phone_link TEXT NOT NULL DEFAULT '+34695717490',
  show_search BOOLEAN NOT NULL DEFAULT true,
  show_language_selector BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 2: Secondary links (editable, orderable)
CREATE TABLE public.topbar_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  is_external BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 3: Group companies dropdown
CREATE TABLE public.topbar_group_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  logo_url TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.topbar_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topbar_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topbar_group_companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for frontend
CREATE POLICY "Anyone can read topbar_config"
  ON public.topbar_config FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read topbar_links"
  ON public.topbar_links FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read topbar_group_companies"
  ON public.topbar_group_companies FOR SELECT
  USING (true);

-- RLS Policies: Admin write access
CREATE POLICY "Admins can manage topbar_config"
  ON public.topbar_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage topbar_links"
  ON public.topbar_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can manage topbar_group_companies"
  ON public.topbar_group_companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_topbar_config_updated_at
  BEFORE UPDATE ON public.topbar_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_topbar_links_updated_at
  BEFORE UPDATE ON public.topbar_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_topbar_group_companies_updated_at
  BEFORE UPDATE ON public.topbar_group_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default config (singleton)
INSERT INTO public.topbar_config (phone_number, phone_link, show_search, show_language_selector)
VALUES ('695 717 490', '+34695717490', true, true);

-- Insert current links as seed data
INSERT INTO public.topbar_links (label, href, is_external, position, is_active) VALUES
  ('Calculadora', '/lp/calculadora', false, 1, true),
  ('Blog', '/blog', false, 2, true),
  ('Casos de Éxito', '/casos-exito', false, 3, true),
  ('Partners', '/colaboradores', false, 4, true);

-- Insert Capittal as current company
INSERT INTO public.topbar_group_companies (name, url, is_current, position, is_active) VALUES
  ('Capittal', 'https://capittal.es', true, 1, true);