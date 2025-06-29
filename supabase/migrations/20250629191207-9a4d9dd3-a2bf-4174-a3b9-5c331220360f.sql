
-- Crear tabla para gestionar lead magnets
CREATE TABLE public.lead_magnets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('report', 'whitepaper', 'checklist', 'template')),
  sector TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- Contenido generado por IA
  file_url TEXT, -- URL del archivo PDF generado
  landing_page_slug TEXT UNIQUE, -- Slug para la landing page dedicada
  download_count INTEGER NOT NULL DEFAULT 0,
  lead_conversion_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  meta_title TEXT,
  meta_description TEXT,
  featured_image_url TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para trackear descargas de lead magnets
CREATE TABLE public.lead_magnet_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_magnet_id UUID NOT NULL REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_company TEXT,
  user_phone TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT, -- De dónde vino el usuario
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para templates de landing pages
CREATE TABLE public.landing_page_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sector-report', 'valuation-tool', 'consultation', 'generic')),
  template_html TEXT NOT NULL,
  template_config JSONB, -- Configuración personalizable del template
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para lead_magnets (solo admins pueden crear/editar)
CREATE POLICY "Admins can manage lead magnets" 
  ON public.lead_magnets 
  FOR ALL 
  USING (public.current_user_is_admin());

CREATE POLICY "Anyone can view active lead magnets" 
  ON public.lead_magnets 
  FOR SELECT 
  USING (status = 'active');

-- Políticas para downloads (público puede insertar, solo admins pueden ver)
CREATE POLICY "Anyone can create downloads" 
  ON public.lead_magnet_downloads 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all downloads" 
  ON public.lead_magnet_downloads 
  FOR SELECT 
  USING (public.current_user_is_admin());

-- Políticas para templates (solo admins)
CREATE POLICY "Admins can manage templates" 
  ON public.landing_page_templates 
  FOR ALL 
  USING (public.current_user_is_admin());

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_lead_magnets_updated_at
  BEFORE UPDATE ON public.lead_magnets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejor performance
CREATE INDEX idx_lead_magnets_sector ON public.lead_magnets(sector);
CREATE INDEX idx_lead_magnets_type ON public.lead_magnets(type);
CREATE INDEX idx_lead_magnets_status ON public.lead_magnets(status);
CREATE INDEX idx_lead_magnets_slug ON public.lead_magnets(landing_page_slug);
CREATE INDEX idx_downloads_lead_magnet ON public.lead_magnet_downloads(lead_magnet_id);
CREATE INDEX idx_downloads_email ON public.lead_magnet_downloads(user_email);
CREATE INDEX idx_downloads_created_at ON public.lead_magnet_downloads(created_at);

-- Insertar algunos templates por defecto
INSERT INTO public.landing_page_templates (name, type, template_html, template_config) VALUES
('Template Reporte Sectorial', 'sector-report', 
'<div class="landing-template sector-report">
  <header>
    <h1>{{title}}</h1>
    <p>{{description}}</p>
  </header>
  <section class="benefits">
    <h2>Lo que aprenderás:</h2>
    <ul>{{benefits}}</ul>
  </section>
  <section class="form">
    {{downloadForm}}
  </section>
</div>',
'{"customizable_fields": ["title", "description", "benefits"], "color_scheme": "blue", "layout": "centered"}'),

('Template Herramienta de Valoración', 'valuation-tool',
'<div class="landing-template valuation-tool">
  <header>
    <h1>{{title}}</h1>
    <p>{{description}}</p>
  </header>
  <section class="tool-preview">
    <h2>Vista previa de la herramienta</h2>
    {{toolPreview}}
  </section>
  <section class="form">
    {{accessForm}}
  </section>
</div>',
'{"customizable_fields": ["title", "description"], "color_scheme": "green", "layout": "split"}'),

('Template Consulta Gratuita', 'consultation',
'<div class="landing-template consultation">
  <header>
    <h1>{{title}}</h1>
    <p>{{description}}</p>
  </header>
  <section class="value-props">
    <h2>En esta consulta:</h2>
    <ul>{{valueProps}}</ul>
  </section>
  <section class="form">
    {{consultationForm}}
  </section>
</div>',
'{"customizable_fields": ["title", "description", "valueProps"], "color_scheme": "orange", "layout": "centered"}');
