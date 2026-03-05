-- Drop existing separate policies
DROP POLICY IF EXISTS "campaign_presentations_insert" ON storage.objects;
DROP POLICY IF EXISTS "campaign_presentations_select" ON storage.objects;
DROP POLICY IF EXISTS "campaign_presentations_update" ON storage.objects;
DROP POLICY IF EXISTS "campaign_presentations_delete" ON storage.objects;

-- Create single FOR ALL policy matching the working operation-documents pattern
CREATE POLICY "Admin users can manage campaign presentations"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'campaign-presentations'
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'editor', 'viewer')
  )
)
WITH CHECK (
  bucket_id = 'campaign-presentations'
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'editor', 'viewer')
  )
);