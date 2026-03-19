

## Fix: PDF generation matches PPTX content and style

### Problem
The PDF generator (`generateDealhubPdf.tsx`) works correctly in terms of data — it receives the same operations and sections. But visually it produces a completely different-looking document because:
1. It uses Helvetica on basic white/navy backgrounds instead of the PPTX's custom template styling (Plus Jakarta Sans, background images, etc.)
2. The page size is `[960, 540]` (px-based, landscape) but `@react-pdf/renderer` expects points — this produces incorrectly sized pages
3. The layout structure (two-column operation slides, cover, separators) doesn't visually match the PPTX output the user is accustomed to
4. `React.Fragment` receives `data-lov-id` props causing console errors (dev-mode injection issue)

Additionally, the PPTX download shows errors in console but ultimately works — this is likely the `blobToBase64` conversion warnings which are non-blocking.

### Fix approach

**1. Align PDF visual style with PPTX output**
- Update `generateDealhubPdf.tsx` to match the PPTX's design tokens: navy background (`#161B22`), same typography sizing ratios, same layout structure
- Use landscape A4 equivalent in points: `[960, 540]` → `[841.89, 595.28]` (A4 landscape in pt)
- Replicate the same slide structure: full-navy cover, numbered separator pages, operation cards with dark sidebar, closing CTA

**2. Fix React.Fragment warning**
- The `React.Fragment` at line ~349 receives `data-lov-id` from the dev tooling — replace with a wrapper `<>` or ensure no extra props leak. This is cosmetic but noisy.

**3. Pass template context to PDF**
- The PDF generator doesn't receive `fullTemplate` — add it as a parameter so cover text, branding, and colors can be driven by the same template config the user customized for PPTX

### Files to modify
- `src/features/operations-management/utils/generateDealhubPdf.tsx` — fix page sizes, align visual design with PPTX, accept template parameter, fix Fragment warning
- `src/features/operations-management/components/GenerateDealhubModal.tsx` — pass `fullTemplate` to `generateDealhubPdf()`

