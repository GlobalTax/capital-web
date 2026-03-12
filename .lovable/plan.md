

## Fix: Attach shared PDF in Document campaigns

### Root Cause

In `send-campaign-outbound-email/index.ts` (lines 122-132), presentations are fetched filtered by `company_id`:
```typescript
.in("company_id", companyIds)
```

Document campaigns store their shared PDF with `company_id = null`, so this query never matches it.

### Fix

After fetching per-company presentations, also fetch campaign-level documents (where `company_id IS NULL`) and use them as fallback attachments. Additionally, check the campaign type to know when to apply this logic.

**File: `supabase/functions/send-campaign-outbound-email/index.ts`**

1. After fetching per-company presentations (line 128), add a second query for shared documents:
```typescript
// Fetch shared campaign documents (Document mode: company_id is null)
const { data: sharedDocs } = await serviceClient
  .from("campaign_presentations")
  .select("id, campaign_id, storage_path, file_name, status")
  .in("campaign_id", campaignIds)
  .is("company_id", null)
  .eq("status", "assigned");
```

2. Also fetch the campaign record to know its type:
```typescript
const { data: campaignRow } = await serviceClient
  .from("valuation_campaigns")
  .select("id, campaign_type")
  .in("id", campaignIds);
const campaignTypeMap = new Map((campaignRow || []).map(c => [c.id, c.campaign_type]));
```

3. In the attachment-building loop (~line 171-176), add fallback to shared docs when no per-company presentation exists:
```typescript
// If no per-company presentation, check for shared campaign document
if (!pres) {
  const shared = (sharedDocs || []).filter(d => d.campaign_id === email.campaign_id);
  for (const doc of shared) {
    if (doc.storage_path) {
      const att = await downloadPdfFromStorage(serviceClient, doc.storage_path, doc.file_name || "Documento.pdf");
      if (att) attachments.push(att);
    }
  }
}
```

### Impact
- **Valuation campaigns**: No change — they already have per-company presentations matched by `company_id`.
- **Document campaigns**: The shared PDF (uploaded via DocumentStep with `company_id = null`) will now be attached to every email.
- **Follow-ups**: Per existing protocol, follow-ups skip attachments — no change needed there.

Single file change in the edge function. No database migration required.

