
-- Create admin-photos storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-photos', 'admin-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read access for admin-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-photos');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload to admin-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'admin-photos');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete from admin-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'admin-photos');
