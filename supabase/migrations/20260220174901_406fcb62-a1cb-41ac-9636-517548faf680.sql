-- Fix operation-documents storage policies: replace function-based policies
-- with a direct JOIN to admin_users for robustness

DROP POLICY IF EXISTS "Admins view operation documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload operation documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete operation documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins update operation documents" ON storage.objects;

CREATE POLICY "Admin users can manage operation documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'operation-documents'
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
    AND admin_users.role IN ('super_admin', 'admin', 'editor', 'viewer')
  )
)
WITH CHECK (
  bucket_id = 'operation-documents'
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
    AND admin_users.role IN ('super_admin', 'admin', 'editor', 'viewer')
  )
);