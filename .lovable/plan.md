

## Fix: RLS policies for slide-backgrounds storage bucket

### Problem

The `PptxTemplateLibrary` component fails on both `list()` and `upload()` with "new row violates row-level security policy". The current RLS policies on `storage.objects` for `slide-backgrounds` use simple `authenticated` role checks, but Supabase's internal storage operations need admin-verified policies consistent with the rest of the project.

### Root cause

The current policies were created with basic checks (`bucket_id = 'slide-backgrounds'` for `authenticated`), but the project's other buckets use `current_user_is_admin()` or admin_users table lookups. The `list()` operation in Supabase storage can internally trigger write operations (folder metadata), causing RLS violations.

### Fix

**Replace the 4 existing RLS policies** on `storage.objects` for `slide-backgrounds` with a single `ALL` policy using `current_user_is_admin()` (matching the pattern from `campaign-presentations` and others), plus keep public SELECT for read access:

1. Drop existing 4 policies for `slide-backgrounds`
2. Create: `ALL` policy for admin users (SELECT, INSERT, UPDATE, DELETE)
3. Keep: public `SELECT` policy for reading/downloading files

**Single SQL migration** -- no code changes needed. The `PptxTemplateLibrary` component code is correct.

