

## Allow all authenticated users to see all team members for assignment

### Problem
The RLS policy on `admin_users` (`admin_users_select_own_or_super_admin`) restricts SELECT to only the user's own row unless they are a super admin. Non-super-admin users can only see themselves in the assignment dropdown, so they can only assign leads to themselves.

### Solution

Create a `SECURITY DEFINER` function that returns all active admin users (id, name, email only — no sensitive data). Then update the frontend query to use this RPC instead of a direct table query.

#### 1. Database migration — New function `get_active_admin_users`

```sql
CREATE OR REPLACE FUNCTION public.get_active_admin_users()
RETURNS TABLE(user_id UUID, full_name TEXT, email TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.user_id, au.full_name, au.email
  FROM admin_users au
  WHERE au.is_active = true
  ORDER BY au.full_name;
$$;
```

This bypasses RLS safely, exposing only non-sensitive fields (name/email) of active team members.

#### 2. Code change — Use RPC in pipeline hook

**File:** `src/features/leads-pipeline/hooks/useLeadsPipeline.ts`

Replace the direct `.from('admin_users').select(...)` query with `supabase.rpc('get_active_admin_users')`.

### Files to modify
- Database migration (new function)
- `src/features/leads-pipeline/hooks/useLeadsPipeline.ts` — switch admin users query to RPC

