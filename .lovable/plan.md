

## Problem

The `sell_leads` table is missing the `lead_status_crm` column. The recent migration added `acquisition_channel_id`, `lead_received_at`, and `lead_form`, but forgot `lead_status_crm`. Meanwhile, `useInlineUpdate.ts` already declares `hasLeadStatusCrm: true` for `sell_leads`, so the frontend tries to update a column that doesn't exist, causing a database error.

## Plan

### Step 1 — Database migration
Add the missing column to `sell_leads`:

```sql
ALTER TABLE public.sell_leads
  ADD COLUMN IF NOT EXISTS lead_status_crm text;
```

### Step 2 — Update TypeScript types
Add `lead_status_crm` to the `sell_leads` Row/Insert/Update types in `src/integrations/supabase/types.ts`.

### Step 3 — Also check LeadStatusSelect
The `LeadStatusSelect` component only handles 3 table names (`contact_leads`, `company_valuations`, `collaborator_applications`). It needs to also route `sell` lead types to `sell_leads`. This will be verified and fixed if needed.

No other code changes are required since `useInlineUpdate.ts` already has the correct capabilities and field mapping for `sell_leads`.

