
-- Create storage bucket for hero images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Hero images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

-- Allow authenticated users (admins) to manage hero images
CREATE POLICY "Admins can upload hero images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can update hero images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete hero images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-images' AND auth.role() = 'authenticated');
