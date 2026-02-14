
-- =====================================================
-- PE Sector Intelligence (datos del Excel)
-- =====================================================
CREATE TABLE public.pe_sector_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector TEXT NOT NULL,
  subsector TEXT NOT NULL,
  vertical TEXT,
  pe_thesis TEXT,
  quantitative_data TEXT,
  active_pe_firms TEXT,
  platforms_operations TEXT,
  multiples_valuations TEXT,
  consolidation_phase TEXT,
  geography TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pe_sector_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage PE sector intelligence"
  ON public.pe_sector_intelligence FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Public read PE sector intelligence"
  ON public.pe_sector_intelligence FOR SELECT
  USING (is_active = true);

-- =====================================================
-- Content Calendar
-- =====================================================
CREATE TABLE public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'draft', 'review', 'scheduled', 'published', 'archived')),
  scheduled_date DATE,
  published_date DATE,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  target_keywords TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  notes TEXT,
  assigned_to TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  pe_sector_id UUID REFERENCES public.pe_sector_intelligence(id),
  blog_post_id UUID REFERENCES public.blog_posts(id),
  estimated_reading_time INTEGER,
  content_type TEXT DEFAULT 'article' CHECK (content_type IN ('article', 'guide', 'case_study', 'report', 'infographic', 'newsletter')),
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage content calendar"
  ON public.content_calendar FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_content_calendar_updated_at
  BEFORE UPDATE ON public.content_calendar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pe_sector_intelligence_updated_at
  BEFORE UPDATE ON public.pe_sector_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices útiles
CREATE INDEX idx_content_calendar_status ON public.content_calendar(status);
CREATE INDEX idx_content_calendar_scheduled_date ON public.content_calendar(scheduled_date);
CREATE INDEX idx_content_calendar_category ON public.content_calendar(category);
CREATE INDEX idx_pe_sector_intelligence_sector ON public.pe_sector_intelligence(sector);
