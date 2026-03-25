

## Allow any authenticated user to assign leads in the pipeline

### Problem
The RLS policies on `company_valuations` and `contact_leads` restrict UPDATE operations to admin users only (`current_user_is_admin()`). Non-admin authenticated users cannot assign leads because the database rejects their update.

### Solution

#### 1. Database migration — Create a security definer function for lead assignment

Create a `public.assign_lead` function with `SECURITY DEFINER` that any authenticated user can call. It will only update `assigned_to` (and `assigned_at` for valuations), nothing else.

```sql
CREATE OR REPLACE FUNCTION public.assign_lead(
  p_table TEXT,
  p_lead_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_table = 'company_valuations' THEN
    UPDATE company_valuations
    SET assigned_to = p_user_id,
        assigned_at = CASE WHEN p_user_id IS NOT NULL THEN now() ELSE NULL END
    WHERE id = p_lead_id;
  ELSIF p_table = 'contact_leads' THEN
    UPDATE contact_leads
    SET assigned_to = p_user_id
    WHERE id = p_lead_id;
  ELSE
    RAISE EXCEPTION 'Invalid table';
  END IF;
END;
$$;
```

#### 2. Code change — Use RPC instead of direct update

**File:** `src/features/leads-pipeline/hooks/useLeadsPipeline.ts`

In the `assignLeadMutation`, replace the direct `.update()` call with `supabase.rpc('assign_lead', { p_table, p_lead_id, p_user_id })`.

This bypasses the admin-only RLS while still requiring authentication.

### Files to modify
- Database migration (new function)
- `src/features/leads-pipeline/hooks/useLeadsPipeline.ts` — switch to RPC call

