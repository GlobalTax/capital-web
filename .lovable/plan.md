

## Fix: Storage RLS for campaign-presentations bucket

### Root Cause
The current policies use `TO public` with `auth.role() = 'authenticated'` check. Every other working storage bucket policy in this project uses `TO authenticated` with a simple `bucket_id` check. Supabase Storage internally sets the PostgreSQL role to `authenticated` when a valid JWT is present, so `TO authenticated` is the correct approach.

### Solution
Create a new migration that:
1. Drops the 4 current policies ("Campaign presentations ... for authenticated JWT")
2. Recreates them using `TO authenticated` with only `bucket_id = 'campaign-presentations'` — matching the pattern used by all other working buckets (uploads, documents, images, etc.)

```sql
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
```

### Why this will work
This is the exact same pattern used by every other storage bucket in the project (uploads, hero-images, dealsuite-images, admin-videos, etc.) — all use `TO authenticated` with a simple `bucket_id` check. No code changes needed.

