

## Change: Increase description character limit to 1200

**File:** `src/features/operations-management/utils/generateDealhubPptx.ts` (lines 191-193)

Change the truncation limit from 600 to 1200 characters:
- `rawDesc.length > 600` → `rawDesc.length > 1200`
- `rawDesc.substring(0, 597)` → `rawDesc.substring(0, 1197)`
- Update comment accordingly

The `shrinkText: true` on the text box should handle fitting the longer text by reducing font size automatically.

