CREATE POLICY "Authenticated users can update admin-photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'admin-photos')
WITH CHECK (bucket_id = 'admin-photos');