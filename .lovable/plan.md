

## Fix: Move "Aspectos Destacados" lower + define max description length

### Problem
Description box ends at y=4.1 (y=1.3 + h=2.8). "Aspectos Destacados" starts at y=4.2 — only 0.1" gap, causing overlap with long descriptions.

### Changes in `generateDealhubPptx.ts`

1. **Move highlights down:**
   - "Aspectos Destacados" title: y=4.2 → **y=4.5**
   - Bullets: y=4.6 → **y=4.9**, reduce height to 1.9" to stay within slide

2. **Truncate description to safe max:**
   - At 11pt font, 6.7" width, ~1.4 line spacing: the 2.8" box fits ~12 lines of ~85 chars = **~1020 characters**
   - Add a safe cap of **1000 characters** with ellipsis truncation before rendering
   - Add `overflow: 'ellipsis'` as fallback

### Max characters answer
With current settings (11pt, 6.7" wide, 2.8" tall, 1.4x line spacing): **~1000 characters** is the safe maximum for the description field.

