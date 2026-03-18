

## Fix: Prevent description/highlights overlap definitively

### Root cause
pptxgenjs does NOT clip text to the box height — if text overflows `h: 2.8`, it renders below the box boundary, overlapping whatever is beneath. Moving "Aspectos Destacados" down by 0.3" isn't enough when long descriptions overflow.

### Solution (two-pronged)

**In `generateDealhubPptx.ts` → `addOperationSlide`:**

1. **Add `fit: 'shrink'` to the description text box** — this tells pptxgenjs to auto-shrink the font size if text exceeds the box, so it never overflows beyond `h: 2.8`.

2. **Move "Aspectos Destacados" significantly lower:**
   - Title: y=4.5 → **y=5.2**
   - Bullets: y=4.9 → **y=5.6**, height: 1.9 → **h=1.2**

3. **Reduce description char limit from 1000 to 600** as extra safety net.

This guarantees no overlap: description text shrinks to fit its box, and highlights start well below.

