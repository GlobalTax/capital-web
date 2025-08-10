-- Create public bucket for valuation PDFs if not exists
insert into storage.buckets (id, name, public)
values ('valuations', 'valuations', true)
on conflict (id) do nothing;

-- Allow public read access to PDFs in 'valuations' bucket
create policy if not exists "Public can read valuations"
  on storage.objects
  for select
  using (bucket_id = 'valuations');