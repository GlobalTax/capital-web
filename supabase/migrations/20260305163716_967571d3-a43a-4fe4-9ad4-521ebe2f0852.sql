-- Harden storage RLS for campaign-presentations uploads (supports authenticated JWT even when request role resolves via public)
DROP POLICY IF EXISTS "Authenticated users can upload campaign presentations" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read campaign presentations" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update campaign presentations" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete campaign presentations" ON storage.objects;

CREATE POLICY "Campaign presentations insert for authenticated JWT"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'campaign-presentations'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Campaign presentations select for authenticated JWT"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'campaign-presentations'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Campaign presentations update for authenticated JWT"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'campaign-presentations'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'campaign-presentations'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Campaign presentations delete for authenticated JWT"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'campaign-presentations'
  AND auth.role() = 'authenticated'
);