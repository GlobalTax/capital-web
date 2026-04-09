
-- Drop existing policies for slide-backgrounds
DROP POLICY IF EXISTS "Allow authenticated deletes from slide-backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to slide-backgrounds" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from slide-backgrounds" ON storage.objects;

-- Admin full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admin can manage slide-backgrounds" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'slide-backgrounds' AND current_user_is_admin())
WITH CHECK (bucket_id = 'slide-backgrounds' AND current_user_is_admin());

-- Public read access for downloading files
CREATE POLICY "Public can read slide-backgrounds" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'slide-backgrounds');
