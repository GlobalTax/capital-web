

## Fix: Pro Valuation leads missing from Gestión de Leads

### Root Cause

The deduplication tool (`DuplicatesDialog.tsx`) groups contacts across ALL origin tables by email. When a "Valoración Pro" creates a `contact_lead` AND a `company_valuation` exists with the same email, the dedup tool clusters them together and soft-deletes one — typically the `contact_lead`, which is the Pro valuation's primary linked record.

Result: **22 Pro valuation leads** (including Bove Instalaciones) have `is_deleted: true` and no longer appear in the leads list.

### Fix (2 parts)

#### 1. Database migration — Restore erroneously deleted Pro valuation leads

```sql
UPDATE contact_leads
SET is_deleted = false, deleted_at = NULL
WHERE is_deleted = true
  AND referral = 'Valoración Pro'
  AND id IN (
    SELECT linked_lead_id FROM professional_valuations
    WHERE linked_lead_id IS NOT NULL
  );
```

This restores all 22 soft-deleted contact_leads that are actively linked to professional valuations.

#### 2. Code change — Protect Pro valuation leads from deduplication

In `src/components/admin/contacts-v2/DuplicatesDialog.tsx`, modify the `handleDelete` function to skip contacts that have a linked professional valuation (detected via `is_from_pro_valuation` or `referral === 'Valoración Pro'`).

Additionally, update `transformContact` in `useContacts.ts` to correctly set `is_from_pro_valuation` based on `lead.referral === 'Valoración Pro'` or presence in the `proValMap`.

**Files to modify:**
- `src/components/admin/contacts-v2/DuplicatesDialog.tsx` — exclude Pro valuation contacts from deletion candidates in clusters
- `src/components/admin/contacts-v2/hooks/useContacts.ts` — set `is_from_pro_valuation` in `transformContact`
- Database migration to restore deleted records

### Technical Detail

The dedup dialog receives `allContacts` and builds Union-Find clusters by email/CIF/phone. It then soft-deletes all but the "best" record per cluster. The fix will filter out contacts with `is_from_pro_valuation === true` from the deletion candidates, ensuring Pro valuation records are always preserved as the kept record or excluded from dedup entirely.

