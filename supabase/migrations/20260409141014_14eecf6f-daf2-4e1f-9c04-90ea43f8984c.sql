-- Table for buy pipeline email attachments
CREATE TABLE public.buy_pipeline_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.buy_pipeline_attachments ENABLE ROW LEVEL SECURITY;

-- Admin users can do everything
CREATE POLICY "Admin users can manage buy pipeline attachments"
ON public.buy_pipeline_attachments
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Trigger for updated_at
CREATE TRIGGER update_buy_pipeline_attachments_updated_at
BEFORE UPDATE ON public.buy_pipeline_attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('buy-pipeline-attachments', 'buy-pipeline-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for admin upload/delete
CREATE POLICY "Admin users can upload buy pipeline attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'buy-pipeline-attachments'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admin users can delete buy pipeline attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'buy-pipeline-attachments'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "Anyone can read buy pipeline attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'buy-pipeline-attachments');