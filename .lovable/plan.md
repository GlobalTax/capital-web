

## Fix: `lead_tasks_lead_type_check` constraint blocking collaborator submissions

### Root Cause
When a collaborator application is inserted, the trigger `create_collaborator_tasks` fires and calls `create_lead_tasks('collaborator')`, which inserts a row into `lead_tasks` with `lead_type = 'collaborator'`. However, the check constraint on `lead_tasks` only allows two values:

```
CHECK (lead_type = ANY (ARRAY['valuation', 'contact']))
```

This causes every collaborator submission to fail with error code `23514`.

### Fix
**Database migration** — Update the check constraint to include `'collaborator'`:

```sql
ALTER TABLE lead_tasks DROP CONSTRAINT lead_tasks_lead_type_check;
ALTER TABLE lead_tasks ADD CONSTRAINT lead_tasks_lead_type_check 
  CHECK (lead_type = ANY (ARRAY['valuation', 'contact', 'collaborator']));
```

No code changes needed. This single migration resolves the form submission error.

