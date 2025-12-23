-- Newsletter Template Versions (for versioning system)
CREATE TABLE public.newsletter_template_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  version_name TEXT,
  html_content TEXT NOT NULL,
  subject TEXT,
  intro_text TEXT,
  content_blocks JSONB,
  header_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.newsletter_template_versions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage template versions"
ON public.newsletter_template_versions
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Custom Newsletter Templates (duplicated/edited by user)
CREATE TABLE public.custom_newsletter_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_template_type TEXT NOT NULL DEFAULT 'custom',
  html_content TEXT NOT NULL,
  subject_template TEXT,
  default_intro TEXT,
  header_config JSONB DEFAULT '{"variant": "centered", "showLogo": true}'::jsonb,
  footer_config JSONB DEFAULT '{"variant": "complete", "showSocial": true}'::jsonb,
  theme_id TEXT DEFAULT 'capittal-classic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.custom_newsletter_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage custom templates"
ON public.custom_newsletter_templates
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Newsletter Theme Settings (store active theme preferences)
CREATE TABLE public.newsletter_theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.newsletter_theme_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage theme settings"
ON public.newsletter_theme_settings
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Insert default theme settings
INSERT INTO public.newsletter_theme_settings (setting_key, setting_value) VALUES
('active_theme', '{"id": "capittal-classic", "name": "Capittal Classic"}'::jsonb),
('header_variant', '{"variant": "centered", "showLogo": true}'::jsonb),
('footer_variant', '{"variant": "complete", "showSocial": true, "showLegal": true}'::jsonb);

-- Create indexes
CREATE INDEX idx_template_versions_campaign ON public.newsletter_template_versions(campaign_id);
CREATE INDEX idx_custom_templates_active ON public.custom_newsletter_templates(is_active) WHERE is_active = true;