-- Create storage bucket for market studies
INSERT INTO storage.buckets (id, name, public)
VALUES ('market-studies', 'market-studies', false)
ON CONFLICT (id) DO NOTHING;

-- Create market_studies table
CREATE TABLE public.market_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  sector text,
  description text,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_studies ENABLE ROW LEVEL SECURITY;

-- RLS policies: authenticated users can CRUD
CREATE POLICY "Authenticated users can read market studies"
  ON public.market_studies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert market studies"
  ON public.market_studies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update market studies"
  ON public.market_studies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete market studies"
  ON public.market_studies FOR DELETE
  TO authenticated
  USING (true);

-- Storage policies for market-studies bucket
CREATE POLICY "Authenticated users can upload market studies"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'market-studies');

CREATE POLICY "Authenticated users can read market studies files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'market-studies');

CREATE POLICY "Authenticated users can delete market studies files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'market-studies');