

## Problem

The numeric filter ranges for `facturacion` and `ebitda` use real euro values (e.g., 5M = 5,000,000), but the raw database values are stored at 1/1000 scale. The display already multiplies by 1,000, but the filter comparison on line 635 does not — so selecting "> 5M€" EBITDA excludes companies that should match.

## Fix

**File: `src/pages/admin/ContactListDetailPage.tsx`**

In the numeric range filter logic (~line 635), apply the `* 1000` multiplier for `facturacion` and `ebitda` before comparing against ranges:

```typescript
const raw = Number((c as any)[colKey]) || 0;
const val = (colKey === 'facturacion' || colKey === 'ebitda') ? raw * 1000 : raw;
```

This is a single-line change in the filtering `useMemo` block. The sort logic (~line 675) should also apply the same multiplier for consistent ordering of these two columns.

