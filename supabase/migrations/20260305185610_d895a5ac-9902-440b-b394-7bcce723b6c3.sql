DROP POLICY IF EXISTS "Admin users can manage campaign presentations" ON storage.objects;

CREATE POLICY "Admin users can manage campaign presentations"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'campaign-presentations'
  AND public.current_user_is_admin()
)
WITH CHECK (
  bucket_id = 'campaign-presentations'
  AND public.current_user_is_admin()
);