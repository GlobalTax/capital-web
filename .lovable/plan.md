

## Problem

The `useInlineUpdate` hook's `tableMap` is missing the `buyer_alert` and `rod_download` origins that the contacts-v2 system uses. When you try to update a lead with these origins (shown as "Compras" in the UI), it fails with "Error: origen de lead desconocido".

The existing map has `buyer` -> `buyer_contacts`, but contacts-v2 uses `rod_download` for that same table and `buyer_alert` for `buyer_preferences`.

## Fix

Add the two missing origin mappings to the `tableMap` and their corresponding `tableCapabilities` entries in `src/hooks/useInlineUpdate.ts`:

1. `'buyer_alert'` -> `'buyer_preferences'` (no `lead_status_crm`, no `acquisition_channel`, no `location`, no `lead_form`)
2. `'rod_download'` -> `'buyer_contacts'` (same capabilities as existing `buyer_contacts` entry)

### File: `src/hooks/useInlineUpdate.ts`

**tableMap** (line ~258): Add two entries:
```typescript
'buyer_alert': 'buyer_preferences',
'rod_download': 'buyer_contacts',
```

**tableCapabilities** (line ~154): Add entry for `buyer_preferences`:
```typescript
'buyer_preferences': {
  hasUpdatedAt: true,
  hasLeadReceivedAt: false,
  hasLeadStatusCrm: false,
  hasAcquisitionChannel: false,
  hasLocation: false,
  hasLeadForm: false,
},
```

This is a small, targeted fix -- two lines in the map and one new capabilities block.

