-- Agregar columnas faltantes a landing_page_templates
ALTER TABLE public.landing_page_templates
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS preview_image_url TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Crear tabla landing_pages si no existe
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  template_id UUID REFERENCES public.landing_page_templates(id),
  content_config JSONB NOT NULL DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT false,
  analytics_config JSONB NOT NULL DEFAULT '{}',
  conversion_goals JSONB NOT NULL DEFAULT '[]',
  custom_css TEXT,
  custom_js TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla landing_page_conversions si no existe
CREATE TABLE IF NOT EXISTS public.landing_page_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id),
  conversion_type TEXT NOT NULL,
  form_data JSONB DEFAULT '{}',
  visitor_id TEXT,
  session_id TEXT,
  conversion_value NUMERIC DEFAULT 0,
  visitor_data JSONB DEFAULT '{}',
  attribution_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla landing_page_variants si no existe
CREATE TABLE IF NOT EXISTS public.landing_page_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id),
  variant_name TEXT NOT NULL,
  content_config JSONB NOT NULL DEFAULT '{}',
  traffic_percentage NUMERIC NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conversion_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_variants ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para landing_pages
DROP POLICY IF EXISTS "Admin can manage landing pages" ON public.landing_pages;
CREATE POLICY "Admin can manage landing pages" ON public.landing_pages
  FOR ALL USING (current_user_is_admin());

DROP POLICY IF EXISTS "Public can view published landing pages" ON public.landing_pages;
CREATE POLICY "Public can view published landing pages" ON public.landing_pages
  FOR SELECT USING (is_published = true);

-- Políticas RLS para landing_page_conversions
DROP POLICY IF EXISTS "Admin can view conversions" ON public.landing_page_conversions;
CREATE POLICY "Admin can view conversions" ON public.landing_page_conversions
  FOR SELECT USING (current_user_is_admin());

DROP POLICY IF EXISTS "Anyone can insert conversions" ON public.landing_page_conversions;
CREATE POLICY "Anyone can insert conversions" ON public.landing_page_conversions
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para landing_page_variants
DROP POLICY IF EXISTS "Admin can manage variants" ON public.landing_page_variants;
CREATE POLICY "Admin can manage variants" ON public.landing_page_variants
  FOR ALL USING (current_user_is_admin());

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_landing_pages_updated_at ON public.landing_pages;
CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_landing_page_variants_updated_at ON public.landing_page_variants;
CREATE TRIGGER update_landing_page_variants_updated_at
  BEFORE UPDATE ON public.landing_page_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();