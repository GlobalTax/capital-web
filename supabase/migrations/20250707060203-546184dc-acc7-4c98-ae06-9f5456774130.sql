-- Create landing page templates table
CREATE TABLE public.landing_page_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('lead_magnet', 'valuation', 'contact', 'sector', 'custom')),
  template_html TEXT NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create landing pages table
CREATE TABLE public.landing_pages (
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

-- Create landing page conversions table
CREATE TABLE public.landing_page_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  conversion_type TEXT NOT NULL,
  form_data JSONB,
  visitor_id TEXT,
  session_id TEXT,
  conversion_value NUMERIC,
  visitor_data JSONB,
  attribution_data JSONB,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_conversions ENABLE ROW LEVEL SECURITY;

-- Create policies for landing_page_templates
CREATE POLICY "Admins can manage landing page templates" 
ON public.landing_page_templates 
FOR ALL 
USING (current_user_is_admin());

CREATE POLICY "Anyone can view active templates" 
ON public.landing_page_templates 
FOR SELECT 
USING (is_active = true);

-- Create policies for landing_pages
CREATE POLICY "Admins can manage landing pages" 
ON public.landing_pages 
FOR ALL 
USING (current_user_is_admin());

CREATE POLICY "Anyone can view published landing pages" 
ON public.landing_pages 
FOR SELECT 
USING (is_published = true);

-- Create policies for landing_page_conversions
CREATE POLICY "Admins can view landing page conversions" 
ON public.landing_page_conversions 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "Anyone can insert conversions" 
ON public.landing_page_conversions 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX idx_landing_pages_published ON public.landing_pages(is_published, created_at);
CREATE INDEX idx_landing_page_conversions_landing_page_id ON public.landing_page_conversions(landing_page_id);
CREATE INDEX idx_landing_page_conversions_created_at ON public.landing_page_conversions(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_landing_page_templates_updated_at
BEFORE UPDATE ON public.landing_page_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();