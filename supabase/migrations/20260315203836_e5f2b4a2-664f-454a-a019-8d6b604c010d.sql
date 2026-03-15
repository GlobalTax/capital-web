-- Ensure authenticated admin sessions can list files in admin-photos without RLS errors
create policy "Authenticated users can read admin-photos"
on storage.objects
for select
to authenticated
using (bucket_id = 'admin-photos');