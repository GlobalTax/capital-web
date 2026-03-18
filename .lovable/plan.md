

## Plan: Update PPTX generation to match refined slide layout

### What changed (from screenshot)

1. **"Más Información" button color** — Changed from blue (`2563EB`) to a muted gray tone (appears to be ~`3A3F47` or similar dark gray, not the bright accent blue)
2. **Overall distribution looks consistent** with current code — no major layout shifts needed

### Changes in `generateDealhubPptx.ts`

**Single change — CTA button fill color (lines 298-305):**
- Change the `fill.color` of the "Más Información" rounded rect from `ACCENT` (`2563EB`) to a muted dark gray (`3A3F47`) matching the screenshot
- Keep text white

This is a ~2 line change in the `addOperationSlide` function.

