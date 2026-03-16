

## Plan: Fix photo library listing + clean console noise

### Problem
The `supabase.storage.from('admin-photos').list()` API call fails with "new row violates row-level security policy" (status 400). This is NOT a policy issue on `storage.objects` (all CRUD policies exist and work). The error comes from internal Supabase Storage tables (`buckets_analytics`, etc.) that have RLS enabled with no policies. Direct SQL queries to `storage.objects` work perfectly (verified: 58 files exist).

### Solution

**1. Replace Storage list API with direct query in `usePhotoLibrary.tsx`**

Instead of `supabase.storage.from(BUCKET).list()`, query `storage.objects` directly via PostgREST:

```typescript
const { data, error } = await supabase
  .from('objects' as any)  // storage.objects via PostgREST
  ...
```

Wait - PostgREST only exposes the `public` schema by default, not `storage`. We can't query `storage.objects` directly through the JS client.

**Alternative approach: Create a `public` schema function** that lists files from the storage bucket using `SECURITY DEFINER` to bypass RLS on internal tables:

```sql
CREATE OR REPLACE FUNCTION public.list_admin_photos(folder_path TEXT DEFAULT '')
RETURNS TABLE (name TEXT, id UUID, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, metadata JSONB)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, storage
AS $$ ... $$;
```

This function queries `storage.objects` directly, bypassing the Storage API's internal analytics tracking that causes the RLS error.

**2. Update `src/hooks/usePhotoLibrary.tsx`**
- Replace the `supabase.storage.list()` call with `supabase.rpc('list_admin_photos', { folder_path })`.
- Construct public URLs using the known pattern: `{SUPABASE_URL}/storage/v1/object/public/admin-photos/{path}`.
- Keep all other operations (upload, delete, move) using the Storage API since they work fine.

**3. Update `src/core/providers/ConsoleNoiseFilter.tsx`**
- Add patterns for `Max reconnect attempts`, `@firebase/firestore.*transport errored`, `WebSocket is already in CLOSING`, `Failed to load resource.*supabase.*400`.

### Files changed
- New migration: `list_admin_photos` function
- `src/hooks/usePhotoLibrary.tsx`: Use RPC for listing
- `src/core/providers/ConsoleNoiseFilter.tsx`: Add noise patterns

