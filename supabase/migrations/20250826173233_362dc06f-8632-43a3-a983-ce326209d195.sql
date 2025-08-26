-- Fix video playback by making admin-videos bucket public
-- This allows videos to be accessed directly without authentication

UPDATE storage.buckets 
SET public = true 
WHERE id = 'admin-videos';

-- Update RLS policies for admin-videos bucket to allow public read access
DROP POLICY IF EXISTS "Admin videos are not publicly accessible" ON storage.objects;

CREATE POLICY "Admin videos are publicly viewable" ON storage.objects
FOR SELECT 
USING (bucket_id = 'admin-videos');

CREATE POLICY "Authenticated users can upload admin videos" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'admin-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update admin videos" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'admin-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete admin videos" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'admin-videos' 
  AND auth.role() = 'authenticated'
);