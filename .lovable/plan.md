

## Plan: Fix operation slide layout in Dealhub PPTX

### Problems identified
1. **"Oportunidad" text is cramped** — The value column for info rows starts at `rightX + 1.8` with only `rightW - 2.2` width (~2.3"), too narrow for long descriptions.
2. **Sector appears twice** — Once as a blue badge on the left column (line 190-193) AND again in the "Resumen" card info rows (line 239).
3. **Text overflow** — Description box has fixed height (2.8") with `shrinkText: true` which can produce tiny unreadable text. The "Oportunidad" value uses a single-line height (0.3") that clips multi-line content.

### Changes in `generateDealhubPptx.ts`

**A. Widen the dark card and fix Oportunidad layout**
- Increase `rightW` from `4.5` to `5.0`
- Adjust `rightX` from `8.2` to `7.7` (keeping within slide margins)
- Reduce `leftW` from `7.2` to `6.7`
- For info rows: make "Oportunidad" value span wider — use full card width with text wrapping and a taller row height (~0.7") so long descriptions fit
- Stack label above value instead of side-by-side for "Oportunidad" only

**B. Remove duplicate sector**
- Remove the sector badge from the left column (lines 190-193)
- Keep sector only in the "Resumen" card on the right

**C. Fix text rendering**
- Description: remove `shrinkText: true`, increase height to 3.2" and rely on `wrap: true` with `overflow: 'ellipsis'`
- Oportunidad row: increase height to accommodate multi-line text, enable `wrap: true`
- Adjust subsequent Y positions for info rows dynamically since Oportunidad takes more space
- Move "Aspectos Destacados" Y position up slightly since we removed the sector badge

