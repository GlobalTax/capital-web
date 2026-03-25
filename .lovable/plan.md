

## Fix: Upsert conflict — missing unique constraint on `(campaign_id, company_id)`

### Root Cause
The `campaign_presentations` table has a unique constraint on `(campaign_id, file_name)` but NOT on `(campaign_id, company_id)`. The bulk assign upsert uses `onConflict: 'campaign_id,company_id'`, which fails because no matching constraint exists.

### Fix

1. **Database migration** — Add a unique constraint:
```sql
ALTER TABLE public.campaign_presentations 
ADD CONSTRAINT campaign_presentations_campaign_company_unique 
UNIQUE (campaign_id, company_id);
```

2. **No code changes needed** — the existing `useCampaignPresentations.ts` upsert with `onConflict: 'campaign_id,company_id'` will work once the constraint exists.

