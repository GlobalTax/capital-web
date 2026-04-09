
INSERT INTO storage.buckets (id, name, public)
VALUES ('slide-backgrounds', 'slide-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads to slide-backgrounds"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'slide-backgrounds');

CREATE POLICY "Allow authenticated updates to slide-backgrounds"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'slide-backgrounds');

CREATE POLICY "Allow authenticated deletes from slide-backgrounds"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'slide-backgrounds');

CREATE POLICY "Allow public read from slide-backgrounds"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'slide-backgrounds');
