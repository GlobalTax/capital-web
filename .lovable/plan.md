

## Fix: Remove non-existent columns from collaborator insert

### Root Cause
The error `PGRST204: Could not find the 'referrer' column` occurs because the hook sends `referrer`, `utm_source`, `utm_medium`, and `utm_campaign` fields, but these columns do not exist on the `collaborator_applications` table. Only `user_agent` exists.

### Fix

**File: `src/hooks/useCollaboratorApplications.tsx`** (lines 40-44)

Remove the 4 non-existent tracking fields from the insert payload, keeping only `user_agent`:

```typescript
const { error } = await supabase
  .from('collaborator_applications')
  .insert({
    full_name: applicationData.fullName.trim(),
    email: applicationData.email.trim(),
    phone: applicationData.phone.trim(),
    company: applicationData.company?.trim() || null,
    profession: applicationData.profession.trim(),
    experience: applicationData.experience?.trim() || null,
    motivation: applicationData.motivation?.trim() || null,
    user_agent: trackingData.user_agent,
    // REMOVED: referrer, utm_source, utm_medium, utm_campaign (columns don't exist)
  });
```

This single change fixes the insert. The notification and sync-leads calls already pass tracking data separately, so no data is lost.

