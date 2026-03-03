
-- Table for campaign presentations
CREATE TABLE public.campaign_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.valuation_campaigns(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.valuation_campaign_companies(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  match_confidence REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unassigned' CHECK (status IN ('assigned','unassigned','error')),
  assigned_manually BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_presentations_campaign ON public.campaign_presentations(campaign_id);
CREATE INDEX idx_campaign_presentations_company ON public.campaign_presentations(company_id);

-- RLS
ALTER TABLE public.campaign_presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can select campaign_presentations"
  ON public.campaign_presentations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert campaign_presentations"
  ON public.campaign_presentations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaign_presentations"
  ON public.campaign_presentations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete campaign_presentations"
  ON public.campaign_presentations FOR DELETE TO authenticated USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('campaign-presentations', 'campaign-presentations', false, 52428800, ARRAY['application/pdf']);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload campaign presentations"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'campaign-presentations');

CREATE POLICY "Authenticated users can read campaign presentations"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'campaign-presentations');

CREATE POLICY "Authenticated users can update campaign presentations"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'campaign-presentations');

CREATE POLICY "Authenticated users can delete campaign presentations"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'campaign-presentations');
