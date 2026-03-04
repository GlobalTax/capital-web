

## Fix PDF Upload in "Presentaciones" Phase

### Problem
The hook uses `as any` type casts on Supabase queries for `campaign_presentations`, which likely causes silent failures. The table exists in the types but the code bypasses type checking. Additionally, there's no UNIQUE constraint on `(campaign_id, file_name)`, no upload progress tracking, no detailed console logging, and no delete confirmation.

### Changes

**1. Migration: Add UNIQUE constraint**
```sql
ALTER TABLE public.campaign_presentations 
  ADD CONSTRAINT campaign_presentations_campaign_file_unique 
  UNIQUE (campaign_id, file_name);
```

**2. Rewrite `src/hooks/useCampaignPresentations.ts`**
- Remove all `as any` casts -- use proper typed Supabase calls since `campaign_presentations` exists in the generated types
- Add detailed `console.log` at every step: "Subiendo archivo:", "Storage OK:", "BD insert OK:", "ERROR archivo X:"
- Upload files one-by-one with individual error handling (continue on failure)
- Track upload progress state: `{ current: number, total: number, errors: string[] }`
- On duplicate detection (check by campaign_id + file_name), upsert instead of failing
- After each successful file, immediately invalidate the query so the table updates in real-time
- Return upload results summary `{ success: number, errors: { file: string, reason: string }[] }`

**3. Rewrite `src/components/admin/campanas-valoracion/steps/PresentationsStep.tsx`**
- Add upload progress bar: "Subiendo 3/12..." with a Progress component
- After upload completes, show summary toast: "X archivos subidos. Y errores."
- Add delete confirmation dialog (AlertDialog) before deleting
- Add row number column (#)
- Add "Fecha subida" column showing `created_at` formatted
- Keep assignment UI (IA + manual) as-is -- not touching that logic per requirements

### Key fix
The main bug is likely that `as any` casts suppress Supabase PostgREST errors. By using the proper typed table name `campaign_presentations` (which exists in `types.ts`), errors will surface properly and inserts will work correctly.

