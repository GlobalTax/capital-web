

## Fix RLS Error on Campaign Presentations Upload

### Root Cause
The storage UPDATE policy for `campaign-presentations` bucket has `USING` but is **missing `WITH CHECK`**. When the code uploads with `upsert: true`, Supabase tries UPDATE on existing files, which fails because the UPDATE policy can't validate the new row without a `WITH CHECK` clause.

The `campaign_presentations` **table** RLS is fine -- all 4 policies are correctly in place. The issue is solely in the storage layer.

### Fix

**Single migration** to drop and recreate the storage UPDATE policy with proper `WITH CHECK`:

```sql
DROP POLICY "Authenticated users can update campaign presentations" ON storage.objects;

CREATE POLICY "Authenticated users can update campaign presentations"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'campaign-presentations')
  WITH CHECK (bucket_id = 'campaign-presentations');
```

### Files Changed
- 1 new migration file only. No code changes needed.

