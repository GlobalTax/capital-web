

## Plan: Fix Photo Library listing

### Problem
The 20 photos uploaded successfully (confirmed in database), but `supabase.storage.from('admin-photos').list('', {...})` returns empty. Passing an empty string `''` as the path in some Supabase JS client versions doesn't correctly list root-level files.

### Fix
**File: `src/hooks/usePhotoLibrary.tsx` (line 28-29)**

Change:
```typescript
.list('', { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });
```

To:
```typescript
.list(undefined, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });
```

Additionally, add error logging to help debug if the issue persists:
```typescript
console.log('Photo library list result:', { data, error });
```

### Why
Supabase storage `list()` with `''` (empty string) can behave differently than `list(undefined)` — some versions interpret `''` as a literal folder name rather than "root". Using `undefined` explicitly requests root-level listing.

One file, one-line change.

