

## Plan: Show "Rango Facturación" and "Rango EBITDA" labels for buy-side cards

### Problem
Buy-side (acquisition) operation cards show ranges correctly but the labels still say "Facturación" and "EBITDA" instead of "Rango Facturación" and "Rango EBITDA".

### Change

**File: `src/components/operations/OperationCard.tsx`**

Update the two label spans (lines 285 and 297) to show different text when the operation is buy-side with range data:

- Line 285: Change from `t('operations.card.revenue')` to conditionally show `"Rango Facturación"` when `hasRevenueRange`, otherwise keep the existing translation.
- Line 297: Change from `t('operations.card.ebitda')` to conditionally show `"Rango EBITDA"` when `hasEbitdaRange`, otherwise keep the existing translation.

This is a two-line change in a single file.

