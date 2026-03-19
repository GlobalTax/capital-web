

## Fix: Remove remaining mailto/email references from ROD catalog

### Problem
The "Más información" hyperlink on **operation slides** was fixed, but the email `lluis@capittal.es` still appears in two places:

1. **PPTX closing slide** (line 467): Shows `lluis@capittal.es` as plain text (default value)
2. **PDF closing slide** (line 516): Shows `lluis@capittal.es` as display text, linking to `capittal.es/oportunidades`
3. **Template PPTX file**: The uploaded `.pptx` template may have hardcoded mailto links in its XML that get copied as-is during merge — this cannot be fixed in code, only by re-uploading a clean template

### Changes

**1. `src/features/operations-management/utils/generateDealhubPptx.ts`** (line 464-471)
- Change the closing slide email section to show `capittal.es/oportunidades` instead of `lluis@capittal.es`
- Add a hyperlink to `https://capittal.es/oportunidades` so clicking it goes to the marketplace

**2. `src/features/operations-management/utils/generateDealhubPdf.tsx`** (line 510-517)
- Change the display text from `lluis@capittal.es` to `capittal.es/oportunidades`

### Note about the template PPTX
If the mailto link also appears on a slide that comes from the uploaded template file (not the generated operation slides), the only fix is to edit the template `.pptx` file itself and re-upload it via the template library. The merge function copies template slides verbatim.

