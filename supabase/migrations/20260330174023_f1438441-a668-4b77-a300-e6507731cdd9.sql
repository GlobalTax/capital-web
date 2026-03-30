
-- Table to track files uploaded to search fund profiles
CREATE TABLE public.sf_fund_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.sf_funds(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sf_fund_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sf_fund_files"
  ON public.sf_fund_files FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert sf_fund_files"
  ON public.sf_fund_files FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sf_fund_files"
  ON public.sf_fund_files FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_sf_fund_files_fund_id ON public.sf_fund_files(fund_id);

-- Storage bucket for SF files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('sf-fund-files', 'sf-fund-files', true, 20971520)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload sf files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sf-fund-files');

CREATE POLICY "Anyone can view sf files"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'sf-fund-files');

CREATE POLICY "Authenticated users can delete sf files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'sf-fund-files');
