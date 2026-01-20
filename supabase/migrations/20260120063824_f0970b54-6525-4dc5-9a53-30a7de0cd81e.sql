-- Presentation Engine Database Schema

-- Enum for presentation types
CREATE TYPE public.presentation_type AS ENUM ('teaser_sell', 'firm_deck', 'client_deck', 'one_pager', 'mandate_deck', 'custom');

-- Enum for slide layout types
CREATE TYPE public.slide_layout AS ENUM ('title', 'hero', 'stats', 'bullets', 'comparison', 'timeline', 'team', 'financials', 'closing', 'custom');

-- Enum for share permissions
CREATE TYPE public.share_permission AS ENUM ('view', 'download_pdf', 'edit');

-- Brand Kits table
CREATE TABLE public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  logo_dark_url TEXT,
  primary_color TEXT DEFAULT '#0f172a',
  secondary_color TEXT DEFAULT '#64748b',
  accent_color TEXT DEFAULT '#3b82f6',
  background_light TEXT DEFAULT '#ffffff',
  background_dark TEXT DEFAULT '#0f172a',
  font_heading TEXT DEFAULT 'Inter',
  font_body TEXT DEFAULT 'Inter',
  footer_text TEXT,
  disclaimer_text TEXT,
  watermark_text TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Presentation Projects
CREATE TABLE public.presentation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type public.presentation_type NOT NULL DEFAULT 'custom',
  brand_kit_id UUID REFERENCES public.brand_kits(id),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  is_confidential BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  empresa_id UUID REFERENCES public.empresas(id),
  client_name TEXT,
  project_code TEXT
);

-- Presentation Versions (for version history)
CREATE TABLE public.presentation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.presentation_projects(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  snapshot JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Slides
CREATE TABLE public.presentation_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.presentation_projects(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  layout public.slide_layout NOT NULL DEFAULT 'custom',
  headline TEXT,
  subline TEXT,
  content JSONB DEFAULT '{}',
  background_color TEXT,
  background_image_url TEXT,
  text_color TEXT,
  is_hidden BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Presentation Assets (images, logos, etc.)
CREATE TABLE public.presentation_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.presentation_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Sharing Links
CREATE TABLE public.presentation_sharing_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.presentation_projects(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  permission public.share_permission NOT NULL DEFAULT 'view',
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  recipient_email TEXT,
  recipient_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  last_accessed_at TIMESTAMPTZ
);

-- Review Comments
CREATE TABLE public.presentation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.presentation_projects(id) ON DELETE CASCADE NOT NULL,
  slide_id UUID REFERENCES public.presentation_slides(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES public.presentation_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Log
CREATE TABLE public.presentation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.presentation_projects(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Presentation Templates
CREATE TABLE public.presentation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.presentation_type NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  slides_config JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_presentation_projects_status ON public.presentation_projects(status);
CREATE INDEX idx_presentation_projects_type ON public.presentation_projects(type);
CREATE INDEX idx_presentation_slides_project ON public.presentation_slides(project_id, order_index);
CREATE INDEX idx_presentation_sharing_token ON public.presentation_sharing_links(token);
CREATE INDEX idx_presentation_sharing_active ON public.presentation_sharing_links(is_active, expires_at);

-- Enable RLS
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_sharing_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin users
CREATE POLICY "Admin users can manage brand kits" ON public.brand_kits
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can manage presentations" ON public.presentation_projects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can manage versions" ON public.presentation_versions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can manage slides" ON public.presentation_slides
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can manage assets" ON public.presentation_assets
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can manage sharing links" ON public.presentation_sharing_links
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can manage comments" ON public.presentation_comments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can view audit log" ON public.presentation_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin users can manage templates" ON public.presentation_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Public access for shared presentations (via token)
CREATE POLICY "Public can view shared presentations" ON public.presentation_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.presentation_sharing_links sl
      WHERE sl.project_id = presentation_projects.id
        AND sl.is_active = true
        AND (sl.expires_at IS NULL OR sl.expires_at > now())
    )
  );

CREATE POLICY "Public can view shared slides" ON public.presentation_slides
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.presentation_sharing_links sl
      WHERE sl.project_id = presentation_slides.project_id
        AND sl.is_active = true
        AND (sl.expires_at IS NULL OR sl.expires_at > now())
    )
  );

-- Anyone can read templates
CREATE POLICY "Anyone can view active templates" ON public.presentation_templates
  FOR SELECT USING (is_active = true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_presentation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_brand_kits_updated_at
  BEFORE UPDATE ON public.brand_kits
  FOR EACH ROW EXECUTE FUNCTION public.update_presentation_updated_at();

CREATE TRIGGER update_presentation_projects_updated_at
  BEFORE UPDATE ON public.presentation_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_presentation_updated_at();

CREATE TRIGGER update_presentation_slides_updated_at
  BEFORE UPDATE ON public.presentation_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_presentation_updated_at();

-- Insert default templates
INSERT INTO public.presentation_templates (name, type, description, display_order, slides_config) VALUES
(
  'Teaser Sell-Side',
  'teaser_sell',
  'Professional 8-slide teaser for sell-side M&A transactions',
  1,
  '[
    {"layout": "title", "headline": "Confidential Information Memorandum", "subline": "Project [Code Name]"},
    {"layout": "hero", "headline": "Investment Highlights", "content": {"bullets": ["Key highlight 1", "Key highlight 2", "Key highlight 3"]}},
    {"layout": "stats", "headline": "Company Overview", "content": {"stats": [{"label": "Revenue", "value": "€XX M"}, {"label": "EBITDA", "value": "€XX M"}, {"label": "Employees", "value": "XXX"}]}},
    {"layout": "bullets", "headline": "Business Description", "content": {"bullets": ["Core business activity", "Market position", "Competitive advantages"]}},
    {"layout": "financials", "headline": "Financial Summary", "content": {"table": true}},
    {"layout": "bullets", "headline": "Growth Opportunities", "content": {"bullets": ["Growth driver 1", "Growth driver 2", "Growth driver 3"]}},
    {"layout": "timeline", "headline": "Transaction Timeline", "content": {"phases": ["Phase 1", "Phase 2", "Phase 3"]}},
    {"layout": "closing", "headline": "Next Steps", "subline": "Contact Information"}
  ]'::jsonb
),
(
  'Firm Presentation',
  'firm_deck',
  '6-slide firm credentials and capabilities presentation',
  2,
  '[
    {"layout": "title", "headline": "Capittal Advisory", "subline": "M&A • Strategy • Transactions"},
    {"layout": "hero", "headline": "About Us", "content": {"bullets": ["Independent M&A advisory", "Focus on mid-market", "Cross-border expertise"]}},
    {"layout": "stats", "headline": "Track Record", "content": {"stats": [{"label": "Transactions", "value": "XX+"}, {"label": "Volume", "value": "€XXX M"}, {"label": "Years", "value": "XX"}]}},
    {"layout": "team", "headline": "Our Team", "content": {"team": true}},
    {"layout": "bullets", "headline": "Our Services", "content": {"bullets": ["Sell-side advisory", "Buy-side advisory", "Valuations", "Due diligence support"]}},
    {"layout": "closing", "headline": "Let''s Talk", "subline": "Contact us to discuss your transaction"}
  ]'::jsonb
),
(
  'Client Presentation',
  'client_deck',
  '6-slide client-specific presentation',
  3,
  '[
    {"layout": "title", "headline": "Strategic Options Review", "subline": "[Client Name]"},
    {"layout": "hero", "headline": "Executive Summary", "content": {"bullets": ["Key finding 1", "Key finding 2", "Recommendation"]}},
    {"layout": "stats", "headline": "Current Position", "content": {"stats": [{"label": "Revenue", "value": "€XX M"}, {"label": "Growth", "value": "XX%"}, {"label": "Margin", "value": "XX%"}]}},
    {"layout": "comparison", "headline": "Strategic Options", "content": {"options": ["Option A", "Option B", "Option C"]}},
    {"layout": "bullets", "headline": "Recommended Approach", "content": {"bullets": ["Step 1", "Step 2", "Step 3"]}},
    {"layout": "closing", "headline": "Next Steps", "subline": "Timeline and actions"}
  ]'::jsonb
),
(
  'One Pager',
  'one_pager',
  'Compact 3-slide executive summary',
  4,
  '[
    {"layout": "title", "headline": "Executive Summary", "subline": "Project Overview"},
    {"layout": "stats", "headline": "Key Metrics", "content": {"stats": [{"label": "Metric 1", "value": "Value"}, {"label": "Metric 2", "value": "Value"}]}},
    {"layout": "closing", "headline": "Conclusion", "subline": "Contact for details"}
  ]'::jsonb
);

-- Insert default brand kit
INSERT INTO public.brand_kits (name, is_default, footer_text, disclaimer_text, watermark_text) VALUES
(
  'Capittal Default',
  true,
  'Capittal Advisory • Confidential',
  'This document is confidential and intended solely for the use of the individual or entity to whom it is addressed.',
  'CONFIDENTIAL'
);