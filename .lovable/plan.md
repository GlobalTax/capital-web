

## Fix: Drop the missing INSERT policy for slide-backgrounds

### Problem

The previous migration dropped 3 of 4 existing policies but missed the original INSERT policy: `"Allow authenticated uploads to slide-backgrounds"`. This policy still exists in the database and conflicts with the new admin-only `ALL` policy. Supabase's `list()` operation internally triggers write operations that hit this conflicting policy, causing RLS errors on both list and upload.

### Fix

**Single SQL migration** — one line:

```sql
DROP POLICY IF EXISTS "Allow authenticated uploads to slide-backgrounds" ON storage.objects;
```

No code changes needed. After this, only the two correct policies will remain:
1. `"Admin can manage slide-backgrounds"` — full CRUD for admins
2. `"Public can read slide-backgrounds"` — read access for all

