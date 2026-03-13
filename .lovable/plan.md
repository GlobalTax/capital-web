

## Fix: PDF upload in Document campaigns

### Root Cause

`DocumentStep.tsx` line 53-59 calls the `upload_blob` action without the required `bucket` field. The edge function validates `bucket` and `base64` are present (line 113) and returns 400 when `bucket` is missing.

### Fix

Add `bucket: 'campaign-presentations'` to the request body in `DocumentStep.tsx` line 54.

```typescript
// Before
body: {
  action: 'upload_blob',
  path: storagePath,
  base64,
  contentType: 'application/pdf',
}

// After
body: {
  action: 'upload_blob',
  bucket: 'campaign-presentations',
  path: storagePath,
  base64,
  contentType: 'application/pdf',
}
```

One line change, zero risk to existing functionality.

