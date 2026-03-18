

## Safe description character limit

**Analysis of current layout:**
- Description box: y=1.3, h=2.8" (ends at y=4.1)
- "Aspectos Destacados": starts at y=5.2 (1.1" gap)
- Font: 11pt, line spacing 1.4x, width 6.7"

**Calculation:**
- Line height: 11pt × 1.4 = ~0.21"
- Lines in 2.8": ~13 lines
- Chars per line at 11pt across 6.7": ~85
- **Safe max without relying on shrinkText: ~13 × 85 ≈ 1100 chars**

However, `shrinkText` in pptxgenjs is unreliable — it sometimes doesn't trigger properly. To guarantee no overlap with a comfortable margin:

**Recommended limit: 800 characters**

This fills the description area nicely (roughly 9-10 lines) with breathing room, and never risks touching "Aspectos Destacados" even if line wrapping is slightly different.

### Change
**File:** `src/features/operations-management/utils/generateDealhubPptx.ts` (line 191-193)

Set limit to 800 chars: `rawDesc.length > 800 ? rawDesc.substring(0, 797) + '...' : rawDesc`

