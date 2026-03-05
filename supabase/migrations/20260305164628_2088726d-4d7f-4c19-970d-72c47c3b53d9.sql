DROP POLICY IF EXISTS "Campaign presentations insert for authenticated JWT" ON storage.objects;
DROP POLICY IF EXISTS "Campaign presentations select for authenticated JWT" ON storage.objects;
DROP POLICY IF EXISTS "Campaign presentations update for authenticated JWT" ON storage.objects;
DROP POLICY IF EXISTS "Campaign presentations delete for authenticated JWT" ON storage.objects;

CREATE POLICY "campaign_presentations_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'campaign-presentations');

CREATE POLICY "campaign_presentations_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'campaign-presentations');

CREATE POLICY "campaign_presentations_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'campaign-presentations')
  WITH CHECK (bucket_id = 'campaign-presentations');

CREATE POLICY "campaign_presentations_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'campaign-presentations');