
-- Table for corporate buyer files
CREATE TABLE public.corporate_buyer_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.corporate_buyers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  file_size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.corporate_buyer_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view corporate buyer files"
  ON public.corporate_buyer_files FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admin users can insert corporate buyer files"
  ON public.corporate_buyer_files FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Admin users can delete corporate buyer files"
  ON public.corporate_buyer_files FOR DELETE
  TO authenticated USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('corporate-buyer-files', 'corporate-buyer-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload corporate buyer files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'corporate-buyer-files');

CREATE POLICY "Anyone can view corporate buyer files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'corporate-buyer-files');

CREATE POLICY "Authenticated users can delete corporate buyer files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'corporate-buyer-files');
