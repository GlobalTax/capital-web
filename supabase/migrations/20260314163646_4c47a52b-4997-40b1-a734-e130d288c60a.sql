
-- Prerender cache table
CREATE TABLE public.prerender_cache (
  path TEXT PRIMARY KEY,
  html_snapshot TEXT,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  h2s JSONB DEFAULT '[]'::jsonb,
  internal_links JSONB DEFAULT '[]'::jsonb,
  internal_links_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  rendered_at TIMESTAMPTZ,
  source TEXT,
  health TEXT DEFAULT 'red',
  extraction_notes JSONB DEFAULT '[]'::jsonb,
  full_record BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.prerender_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.prerender_cache
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can read prerender_cache" ON public.prerender_cache
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Rate limiting table
CREATE TABLE public.prerender_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('single', 'bulk')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.prerender_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on rate limits" ON public.prerender_rate_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can read rate limits" ON public.prerender_rate_limits
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for rate limit lookups
CREATE INDEX idx_prerender_rate_limits_lookup 
  ON public.prerender_rate_limits (user_id, scan_type, created_at DESC);
