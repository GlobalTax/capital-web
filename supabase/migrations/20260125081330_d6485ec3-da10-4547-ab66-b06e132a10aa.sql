-- =============================================
-- SIDEBAR CONFIGURATION SYSTEM
-- =============================================

-- 1. Create sidebar_sections table
CREATE TABLE public.sidebar_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_collapsed_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create sidebar_items table
CREATE TABLE public.sidebar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.sidebar_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Circle',
  description TEXT,
  badge TEXT CHECK (badge IN ('URGENTE', 'AI', 'NEW', 'HOT', NULL)),
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create sidebar_config table (singleton for global settings)
CREATE TABLE public.sidebar_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_search BOOLEAN DEFAULT true,
  show_version_switcher BOOLEAN DEFAULT true,
  collapsed_by_default BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX idx_sidebar_sections_position ON public.sidebar_sections(position);
CREATE INDEX idx_sidebar_sections_active ON public.sidebar_sections(is_active);
CREATE INDEX idx_sidebar_items_section ON public.sidebar_items(section_id);
CREATE INDEX idx_sidebar_items_position ON public.sidebar_items(position);
CREATE INDEX idx_sidebar_items_active ON public.sidebar_items(is_active);

-- 5. Enable RLS
ALTER TABLE public.sidebar_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidebar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidebar_config ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies - Read access for authenticated users
CREATE POLICY "Authenticated can read sections" 
ON public.sidebar_sections FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can read items" 
ON public.sidebar_items FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can read config" 
ON public.sidebar_config FOR SELECT 
TO authenticated 
USING (true);

-- 7. RLS Policies - Write access for admins (using existing has_role function pattern)
CREATE POLICY "Admins can manage sections" 
ON public.sidebar_sections FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage items" 
ON public.sidebar_items FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage config" 
ON public.sidebar_config FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Create updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION public.update_sidebar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Add triggers for updated_at
CREATE TRIGGER update_sidebar_sections_updated_at
  BEFORE UPDATE ON public.sidebar_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_sidebar_updated_at();

CREATE TRIGGER update_sidebar_items_updated_at
  BEFORE UPDATE ON public.sidebar_items
  FOR EACH ROW EXECUTE FUNCTION public.update_sidebar_updated_at();

CREATE TRIGGER update_sidebar_config_updated_at
  BEFORE UPDATE ON public.sidebar_config
  FOR EACH ROW EXECUTE FUNCTION public.update_sidebar_updated_at();

-- 10. Insert default global config
INSERT INTO public.sidebar_config (show_search, show_version_switcher, collapsed_by_default)
VALUES (true, true, false);

-- 11. Insert initial sections based on current sidebar-config.ts
INSERT INTO public.sidebar_sections (title, description, emoji, position, is_active) VALUES
('📊 DASHBOARD', 'Panel principal', '📊', 0, true),
('🔥 LEADS', 'Centro de gestión de leads', '🔥', 1, true),
('📈 ANALIZAR LEADS', 'Herramientas de análisis', '📈', 2, true),
('✨ CREAR CONTENIDO', 'Herramientas de creación', '✨', 3, true),
('🏢 GESTIONAR DATOS', 'Gestión de datos del sitio', '🏢', 4, true),
('💼 CAPITAL RIESGO', 'Gestión de fondos CR', '💼', 5, true),
('🔍 SEARCH FUNDS', 'Gestión de Search Funds', '🔍', 6, true),
('🤝 BOUTIQUES M&A', 'Gestión de boutiques', '🤝', 7, true),
('🌐 WEB INTELLIGENCE', 'Inteligencia web', '🌐', 8, true),
('📰 NOTICIAS', 'Gestión de noticias', '📰', 9, true),
('📧 MARKETING', 'Herramientas de marketing', '📧', 10, true),
('💼 EMPLEO', 'Gestión de ofertas', '💼', 11, true),
('📚 RECURSOS', 'Recursos y herramientas', '📚', 12, true),
('⚙️ CONFIGURACIÓN', 'Ajustes del sistema', '⚙️', 13, true);

-- 12. Insert items for each section
-- DASHBOARD section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Vista General', '/admin', 'LayoutDashboard', 'Dashboard principal', NULL, 0
FROM public.sidebar_sections WHERE title = '📊 DASHBOARD';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Valoraciones & Recovery', '/admin/valuations', 'Calculator', 'Gestión de valoraciones', NULL, 1
FROM public.sidebar_sections WHERE title = '📊 DASHBOARD';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Search Analytics', '/admin/search-analytics', 'Search', 'Analytics de búsquedas', NULL, 2
FROM public.sidebar_sections WHERE title = '📊 DASHBOARD';

-- LEADS section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Gestión de Leads', '/admin/contacts', 'Target', 'Centro de leads unificado', 'HOT', 0
FROM public.sidebar_sections WHERE title = '🔥 LEADS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Pipeline', '/admin/leads-pipeline', 'Kanban', 'Pipeline de ventas', NULL, 1
FROM public.sidebar_sections WHERE title = '🔥 LEADS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Entrada Manual', '/admin/calculadora-manual', 'UserPlus', 'Añadir leads manualmente', NULL, 2
FROM public.sidebar_sections WHERE title = '🔥 LEADS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Reservas Llamadas', '/admin/bookings', 'CalendarDays', 'Gestión de reservas', NULL, 3
FROM public.sidebar_sections WHERE title = '🔥 LEADS';

-- ANALIZAR LEADS section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Empresas', '/admin/empresas', 'Building2', 'Directorio de empresas', NULL, 0
FROM public.sidebar_sections WHERE title = '📈 ANALIZAR LEADS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Contactos Compra', '/admin/buyer-contacts', 'ShoppingCart', 'Contactos interesados en compra', NULL, 1
FROM public.sidebar_sections WHERE title = '📈 ANALIZAR LEADS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Valoraciones Pro', '/admin/valoraciones-pro', 'Calculator', 'Valoraciones profesionales', NULL, 2
FROM public.sidebar_sections WHERE title = '📈 ANALIZAR LEADS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Documentos Fase 0', '/admin/documentos-fase0', 'Shield', 'Documentación inicial', NULL, 3
FROM public.sidebar_sections WHERE title = '📈 ANALIZAR LEADS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Leads Inversores (ROD)', '/admin/investor-leads', 'TrendingUp', 'Leads de inversores', NULL, 4
FROM public.sidebar_sections WHERE title = '📈 ANALIZAR LEADS';

-- CREAR CONTENIDO section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'AI Content Studio', '/admin/blog-v2', 'FileText', 'Generación de contenido con IA', 'AI', 0
FROM public.sidebar_sections WHERE title = '✨ CREAR CONTENIDO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Casos de Éxito', '/admin/case-studies', 'Award', 'Gestión de casos de éxito', NULL, 1
FROM public.sidebar_sections WHERE title = '✨ CREAR CONTENIDO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Landing Pages', '/admin/landing-pages', 'Globe', 'Gestión de landings', NULL, 2
FROM public.sidebar_sections WHERE title = '✨ CREAR CONTENIDO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Calc. Asesores', '/admin/advisor-calculator', 'Calculator', 'Calculadora para asesores', NULL, 3
FROM public.sidebar_sections WHERE title = '✨ CREAR CONTENIDO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Lead Magnets', '/admin/lead-magnets', 'Zap', 'Gestión de lead magnets', NULL, 4
FROM public.sidebar_sections WHERE title = '✨ CREAR CONTENIDO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Sector Dossiers', '/admin/sector-dossiers', 'FolderOpen', 'Dossiers sectoriales', 'AI', 5
FROM public.sidebar_sections WHERE title = '✨ CREAR CONTENIDO';

-- GESTIONAR DATOS section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Sectores', '/admin/sectors', 'Tags', 'Gestión de sectores', NULL, 0
FROM public.sidebar_sections WHERE title = '🏢 GESTIONAR DATOS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Operaciones', '/admin/operations', 'Building2', 'Gestión de operaciones', NULL, 1
FROM public.sidebar_sections WHERE title = '🏢 GESTIONAR DATOS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Múltiplos', '/admin/multiples', 'TrendingUp', 'Múltiplos de valoración', NULL, 2
FROM public.sidebar_sections WHERE title = '🏢 GESTIONAR DATOS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Múltiplos Asesores', '/admin/advisor-multiples', 'Calculator', 'Múltiplos para asesores', NULL, 3
FROM public.sidebar_sections WHERE title = '🏢 GESTIONAR DATOS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Equipo', '/admin/team', 'Users', 'Gestión del equipo', NULL, 4
FROM public.sidebar_sections WHERE title = '🏢 GESTIONAR DATOS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Testimonios', '/admin/testimonials', 'MessageSquare', 'Gestión de testimonios', NULL, 5
FROM public.sidebar_sections WHERE title = '🏢 GESTIONAR DATOS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Logos Carousel', '/admin/carousel-logos', 'Image', 'Logos del carrusel', NULL, 6
FROM public.sidebar_sections WHERE title = '🏢 GESTIONAR DATOS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Banners', '/admin/banners', 'Megaphone', 'Gestión de banners', NULL, 7
FROM public.sidebar_sections WHERE title = '🏢 GESTIONAR DATOS';

-- CAPITAL RIESGO section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Apollo Import', '/admin/cr-apollo-import', 'Users', 'Importar desde Apollo', NULL, 0
FROM public.sidebar_sections WHERE title = '💼 CAPITAL RIESGO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Directorio CR', '/admin/cr-directory', 'Briefcase', 'Directorio de fondos', NULL, 1
FROM public.sidebar_sections WHERE title = '💼 CAPITAL RIESGO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Portfolio CR', '/admin/cr-portfolio-list', 'Building2', 'Portfolio de inversiones', NULL, 2
FROM public.sidebar_sections WHERE title = '💼 CAPITAL RIESGO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'CR Intelligence', '/admin/fund-intelligence?type=cr', 'Eye', 'Inteligencia de fondos', 'AI', 3
FROM public.sidebar_sections WHERE title = '💼 CAPITAL RIESGO';

-- SEARCH FUNDS section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Apollo Import SF', '/admin/sf-apollo-import', 'Users', 'Importar desde Apollo', NULL, 0
FROM public.sidebar_sections WHERE title = '🔍 SEARCH FUNDS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'SF Radar', '/admin/sf-radar', 'Target', 'Radar de Search Funds', 'AI', 1
FROM public.sidebar_sections WHERE title = '🔍 SEARCH FUNDS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Directorio SF', '/admin/sf-directory', 'Building2', 'Directorio de SF', NULL, 2
FROM public.sidebar_sections WHERE title = '🔍 SEARCH FUNDS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Operaciones SF', '/admin/sf-acquisitions', 'Briefcase', 'Adquisiciones de SF', NULL, 3
FROM public.sidebar_sections WHERE title = '🔍 SEARCH FUNDS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Backers', '/admin/sf-backers', 'Users', 'Gestión de backers', NULL, 4
FROM public.sidebar_sections WHERE title = '🔍 SEARCH FUNDS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Matching', '/admin/sf-matches', 'Target', 'Matching de SF', NULL, 5
FROM public.sidebar_sections WHERE title = '🔍 SEARCH FUNDS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'SF Intelligence', '/admin/fund-intelligence?type=sf', 'Eye', 'Inteligencia de SF', 'AI', 6
FROM public.sidebar_sections WHERE title = '🔍 SEARCH FUNDS';

-- BOUTIQUES M&A section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Apollo Import M&A', '/admin/mna-apollo-import', 'Users', 'Importar desde Apollo', NULL, 0
FROM public.sidebar_sections WHERE title = '🤝 BOUTIQUES M&A';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Directorio M&A', '/admin/mna-directory', 'Building2', 'Directorio de boutiques', NULL, 1
FROM public.sidebar_sections WHERE title = '🤝 BOUTIQUES M&A';

-- WEB INTELLIGENCE section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Apollo Visitors', '/admin/apollo-visitors', 'Eye', 'Visitantes de Apollo', NULL, 0
FROM public.sidebar_sections WHERE title = '🌐 WEB INTELLIGENCE';

-- NOTICIAS section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Noticias M&A', '/admin/noticias', 'Newspaper', 'Noticias del sector', NULL, 0
FROM public.sidebar_sections WHERE title = '📰 NOTICIAS';

-- MARKETING section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Costes Campañas', '/admin/campaign-costs', 'TrendingUp', 'Costes de campañas', NULL, 0
FROM public.sidebar_sections WHERE title = '📧 MARKETING';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Newsletter', '/admin/newsletter', 'Mail', 'Gestión de newsletter', NULL, 1
FROM public.sidebar_sections WHERE title = '📧 MARKETING';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Importar Brevo', '/admin/brevo-import', 'Users', 'Importar contactos Brevo', NULL, 2
FROM public.sidebar_sections WHERE title = '📧 MARKETING';

-- EMPLEO section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Ofertas de Empleo', '/admin/job-offers', 'Briefcase', 'Gestión de ofertas', NULL, 0
FROM public.sidebar_sections WHERE title = '💼 EMPLEO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Aplicaciones', '/admin/job-applications', 'Users', 'Aplicaciones recibidas', NULL, 1
FROM public.sidebar_sections WHERE title = '💼 EMPLEO';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Categorías', '/admin/job-categories', 'Tags', 'Categorías de empleo', NULL, 2
FROM public.sidebar_sections WHERE title = '💼 EMPLEO';

-- RECURSOS section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Test Exit-Ready', '/admin/recursos/exit-ready', 'ClipboardList', 'Test de preparación', NULL, 0
FROM public.sidebar_sections WHERE title = '📚 RECURSOS';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Documentos ROD', '/admin/rod-documents', 'FileText', 'Documentos ROD', NULL, 1
FROM public.sidebar_sections WHERE title = '📚 RECURSOS';

-- CONFIGURACIÓN section
INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Notificaciones', '/admin/notifications', 'Bell', 'Centro de notificaciones', NULL, 0
FROM public.sidebar_sections WHERE title = '⚙️ CONFIGURACIÓN';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Usuarios Admin', '/admin/users', 'Users', 'Gestión de usuarios', NULL, 1
FROM public.sidebar_sections WHERE title = '⚙️ CONFIGURACIÓN';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Workflow Emails', '/admin/workflow-settings', 'Workflow', 'Configuración de workflows', NULL, 2
FROM public.sidebar_sections WHERE title = '⚙️ CONFIGURACIÓN';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Destinatarios', '/admin/notification-recipients', 'Mail', 'Destinatarios de notificaciones', NULL, 3
FROM public.sidebar_sections WHERE title = '⚙️ CONFIGURACIÓN';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'TopBar', '/admin/settings/topbar', 'LayoutDashboard', 'Configuración del TopBar', 'NEW', 4
FROM public.sidebar_sections WHERE title = '⚙️ CONFIGURACIÓN';

INSERT INTO public.sidebar_items (section_id, title, url, icon, description, badge, position) 
SELECT id, 'Navegación Sidebar', '/admin/settings/sidebar', 'Menu', 'Configuración del Sidebar', 'NEW', 5
FROM public.sidebar_sections WHERE title = '⚙️ CONFIGURACIÓN';