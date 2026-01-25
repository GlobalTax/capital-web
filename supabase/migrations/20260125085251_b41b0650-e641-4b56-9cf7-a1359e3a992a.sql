-- Create dashboard_highlights table for quick links
CREATE TABLE public.dashboard_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 50),
  url TEXT NOT NULL CHECK (char_length(url) <= 500),
  icon TEXT NOT NULL DEFAULT 'Link',
  description TEXT CHECK (char_length(description) <= 100),
  color TEXT DEFAULT 'blue',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for ordering
CREATE INDEX idx_dashboard_highlights_position ON public.dashboard_highlights(position);
CREATE INDEX idx_dashboard_highlights_active ON public.dashboard_highlights(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_dashboard_highlights_updated_at
  BEFORE UPDATE ON public.dashboard_highlights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.dashboard_highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage, authenticated can view active
CREATE POLICY "Admins can manage highlights"
  ON public.dashboard_highlights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can view active highlights"
  ON public.dashboard_highlights FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Add comment
COMMENT ON TABLE public.dashboard_highlights IS 'Quick links/highlights shown in the admin dashboard sidebar';