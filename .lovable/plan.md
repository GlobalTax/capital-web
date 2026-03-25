

## Fix: Drop conflicting unique constraint on `(campaign_id, file_name)`

### Problem
The existing unique constraint `campaign_presentations_campaign_file_unique` on `(campaign_id, file_name)` prevents assigning the same file to multiple companies — which is exactly what "Aplicar a todas" needs to do.

### Fix

1. **Database migration** — Drop the old constraint that no longer makes sense:
```sql
ALTER TABLE public.campaign_presentations 
DROP CONSTRAINT campaign_presentations_campaign_file_unique;
```

The `(campaign_id, company_id)` unique constraint we just added is the correct one — each company gets one presentation per campaign, but the same file can be shared across companies.

2. **No code changes needed.**

