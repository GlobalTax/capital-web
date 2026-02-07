
-- Add new columns to dealsuite_deals
ALTER TABLE dealsuite_deals
  ADD COLUMN IF NOT EXISTS stake_offered TEXT,
  ADD COLUMN IF NOT EXISTS customer_types TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_company TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for dealsuite images
INSERT INTO storage.buckets (id, name, public)
VALUES ('dealsuite-images', 'dealsuite-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to dealsuite-images
CREATE POLICY "Authenticated users can upload dealsuite images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dealsuite-images' AND auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public read access for dealsuite images"
ON storage.objects FOR SELECT
USING (bucket_id = 'dealsuite-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete dealsuite images"
ON storage.objects FOR DELETE
USING (bucket_id = 'dealsuite-images' AND auth.role() = 'authenticated');
