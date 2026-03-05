DROP POLICY IF EXISTS "Authenticated users can update campaign presentations" ON storage.objects;

CREATE POLICY "Authenticated users can update campaign presentations"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'campaign-presentations')
  WITH CHECK (bucket_id = 'campaign-presentations');