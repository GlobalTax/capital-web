

## Fix: Lower "Aspectos Destacados" position to avoid overlap with description

The description box occupies y=1.3 to y=4.5 (height 3.2"). "Aspectos Destacados" starts at y=4.6, leaving only 0.1" gap. When description text is long, it visually overlaps.

### Change in `generateDealhubPptx.ts`

- Reduce description height from 3.2" to 2.8" (truncate long text with ellipsis)
- Move "Aspectos Destacados" title from y=4.6 to y=4.2
- Move highlights bullets from y=5.0 to y=4.6
- This creates a clear 0.1" gap between description end (y=4.1) and highlights title (y=4.2)

Single file change, ~4 lines modified.

