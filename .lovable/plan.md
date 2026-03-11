

# Fix: Valuation PDF not attaching on send (RLS block)

## Root Cause

The function `ensureValuationPdfUploaded` in `ProcessSendStep.tsx` uploads the generated valuation PDF directly to the `valuations` bucket using the **anon client**, which is blocked by RLS policies. 

For "campaña para pruebas" it works because those companies already had `pdf_url` populated (line 137 skips upload), so no upload was needed. For all other campaigns, `pdf_url` is null → upload attempt → RLS error → no valuation PDF attached.

The error from console confirms: `new row violates row-level security policy`.

## Fix

### 1. Extend Edge Function `upload-campaign-presentation` to support `valuations` bucket

Add a new action `upload_blob` that accepts a bucket name, storage path, and base64 file content via JSON. This reuses the existing admin verification and service_role client.

**File:** `supabase/functions/upload-campaign-presentation/index.ts`

Add handler for `action === "upload_blob"`:
- Accept `{ action: "upload_blob", bucket: string, path: string, base64: string }`
- Validate bucket is one of `["campaign-presentations", "valuations"]`
- Decode base64 to Uint8Array, upload via `adminClient.storage.from(bucket).upload(path, ...)`
- Return `{ success: true, path }`

### 2. Modify `ensureValuationPdfUploaded` in `ProcessSendStep.tsx`

Instead of `supabase.storage.from('valuations').upload(...)`, convert blob to base64 and invoke the Edge Function:

```typescript
const base64 = arrayBufferToBase64(await blob.arrayBuffer());
const { data } = await supabase.functions.invoke('upload-campaign-presentation', {
  body: { action: 'upload_blob', bucket: 'valuations', path: storagePath, base64 }
});
```

Then construct the public URL from the known Supabase URL + bucket + path, and update `valuation_campaign_companies.pdf_url`.

### Files affected
- `supabase/functions/upload-campaign-presentation/index.ts` — add `upload_blob` action
- `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` — refactor `ensureValuationPdfUploaded`

