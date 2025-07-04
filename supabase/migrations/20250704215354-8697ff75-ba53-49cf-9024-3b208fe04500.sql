-- Crear tabla para templates de landing pages
CREATE TABLE public.landing_page_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('lead_magnet', 'valuation', 'contact', 'sector', 'custom')),
  template_html TEXT NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para landing pages creadas
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  template_id UUID REFERENCES public.landing_page_templates(id),
  content_config JSONB NOT NULL DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  is_published BOOLEAN DEFAULT false,
  analytics_config JSONB DEFAULT '{}',
  conversion_goals JSONB DEFAULT '[]',
  custom_css TEXT,
  custom_js TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla para conversiones de landing pages
CREATE TABLE public.landing_page_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  visitor_id TEXT,
  session_id TEXT,
  conversion_type TEXT NOT NULL,
  form_data JSONB,
  visitor_data JSONB,
  attribution_data JSONB,
  conversion_value NUMERIC DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para A/B testing de landing pages
CREATE TABLE public.landing_page_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  content_config JSONB NOT NULL DEFAULT '{}',
  traffic_percentage NUMERIC DEFAULT 50 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  conversion_count INTEGER DEFAULT 0,
  visitor_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.landing_page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_variants ENABLE ROW LEVEL SECURITY;

-- Create policies for landing page templates
CREATE POLICY "Admins can manage landing page templates" 
ON public.landing_page_templates 
FOR ALL 
USING (current_user_is_admin());

CREATE POLICY "Anyone can view active templates" 
ON public.landing_page_templates 
FOR SELECT 
USING (is_active = true);

-- Create policies for landing pages
CREATE POLICY "Admins can manage landing pages" 
ON public.landing_pages 
FOR ALL 
USING (current_user_is_admin());

CREATE POLICY "Anyone can view published landing pages" 
ON public.landing_pages 
FOR SELECT 
USING (is_published = true);

-- Create policies for conversions
CREATE POLICY "Anyone can insert conversions" 
ON public.landing_page_conversions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view conversions" 
ON public.landing_page_conversions 
FOR SELECT 
USING (current_user_is_admin());

-- Create policies for variants
CREATE POLICY "Admins can manage variants" 
ON public.landing_page_variants 
FOR ALL 
USING (current_user_is_admin());

CREATE POLICY "Anyone can view active variants for published pages" 
ON public.landing_page_variants 
FOR SELECT 
USING (is_active = true AND landing_page_id IN (
  SELECT id FROM public.landing_pages WHERE is_published = true
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_landing_page_templates_updated_at
BEFORE UPDATE ON public.landing_page_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_landing_page_variants_updated_at
BEFORE UPDATE ON public.landing_page_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some example templates
INSERT INTO public.landing_page_templates (name, description, type, template_html, template_config) VALUES
('Lead Magnet Básico', 'Template optimizado para captura de leads con recurso descargable', 'lead_magnet', 
'<div class="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10"><section class="container mx-auto px-4 py-16"><div class="max-w-4xl mx-auto text-center"><h1 class="text-4xl md:text-6xl font-bold text-foreground mb-6">{{title}}</h1><p class="text-xl text-muted-foreground mb-8">{{subtitle}}</p><div class="bg-card p-8 rounded-lg shadow-lg max-w-md mx-auto"><h3 class="text-2xl font-semibold mb-4">Descarga Gratuita</h3><form class="space-y-4"><input type="text" placeholder="Nombre completo" class="w-full p-3 border rounded-lg"><input type="email" placeholder="Email empresarial" class="w-full p-3 border rounded-lg"><input type="text" placeholder="Empresa" class="w-full p-3 border rounded-lg"><button type="submit" class="w-full bg-primary text-primary-foreground p-3 rounded-lg font-semibold hover:bg-primary/90">Descargar Ahora</button></form></div></div></section></div>',
'{"fields": ["title", "subtitle", "resource_name", "resource_description"], "colors": {"primary": "hsl(var(--primary))", "background": "hsl(var(--background))"}}'),

('Calculadora Valoración', 'Landing page para la calculadora de valoración', 'valuation',
'<div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100"><section class="container mx-auto px-4 py-16"><div class="max-w-6xl mx-auto"><div class="grid lg:grid-cols-2 gap-12 items-center"><div><h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{{title}}</h1><p class="text-xl text-gray-600 mb-8">{{subtitle}}</p><ul class="space-y-3 mb-8"><li class="flex items-center text-gray-700"><svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>Valoración instantánea</li><li class="flex items-center text-gray-700"><svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>Análisis detallado</li><li class="flex items-center text-gray-700"><svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>100% gratuito</li></ul></div><div class="bg-white p-8 rounded-lg shadow-xl"><h3 class="text-2xl font-semibold mb-6 text-center">Calcula el Valor de tu Empresa</h3><form class="space-y-4"><input type="text" placeholder="Nombre de la empresa" class="w-full p-3 border rounded-lg"><input type="email" placeholder="Email" class="w-full p-3 border rounded-lg"><select class="w-full p-3 border rounded-lg"><option>Selecciona sector</option><option>Tecnología</option><option>Retail</option><option>Servicios</option></select><button type="submit" class="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700">Comenzar Valoración</button></form></div></div></div></section></div>',
'{"fields": ["title", "subtitle"], "redirect_url": "/calculadora-valoracion"}'),

('Contacto Sectorial', 'Landing page para servicios específicos por sector', 'sector',
'<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"><section class="container mx-auto px-4 py-16"><div class="max-w-4xl mx-auto text-center mb-12"><h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{{title}}</h1><p class="text-xl text-gray-600">{{subtitle}}</p></div><div class="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto"><div class="space-y-8"><h2 class="text-2xl font-semibold text-gray-900 mb-4">¿Por qué elegirnos?</h2><div class="space-y-6"><div class="flex items-start space-x-4"><div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div><h3 class="font-semibold text-gray-900">Experiencia Especializada</h3><p class="text-gray-600">{{benefit_1}}</p></div></div><div class="flex items-start space-x-4"><div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div><div><h3 class="font-semibold text-gray-900">Resultados Comprobados</h3><p class="text-gray-600">{{benefit_2}}</p></div></div></div></div><div class="bg-white p-8 rounded-lg shadow-lg"><h3 class="text-2xl font-semibold mb-6">Contacta con Nosotros</h3><form class="space-y-4"><input type="text" placeholder="Nombre completo" class="w-full p-3 border rounded-lg"><input type="email" placeholder="Email" class="w-full p-3 border rounded-lg"><input type="text" placeholder="Empresa" class="w-full p-3 border rounded-lg"><input type="tel" placeholder="Teléfono" class="w-full p-3 border rounded-lg"><textarea placeholder="Cuéntanos sobre tu proyecto" rows="4" class="w-full p-3 border rounded-lg"></textarea><button type="submit" class="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700">Enviar Consulta</button></form></div></div></section></div>',
'{"fields": ["title", "subtitle", "benefit_1", "benefit_2"], "sector_specific": true}');