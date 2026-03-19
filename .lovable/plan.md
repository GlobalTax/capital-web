

## Two changes for the Dealhub catalog generator

### 1. Add hyperlink to "Más Información" CTA button

In `generateDealhubPptx.ts`, the CTA button text is added via `slide.addText()`. pptxgenjs supports hyperlinks natively via the `hyperlink` property on text options. We will add `hyperlink: { url: 'mailto:lluis@capittal.es' }` to the CTA text so that clicking "Más Información →" in the generated PPTX opens the user's email client.

**File**: `src/features/operations-management/utils/generateDealhubPptx.ts` (lines ~408-412)
- Add `hyperlink: { url: 'mailto:lluis@capittal.es' }` to the `addText` options for the CTA.

### 2. Add PDF download option for the generated catalog

Currently the catalog generates a `.pptx` file. We'll add a format selector in the `GenerateDealhubModal` so the user can choose between PPTX and PDF:

- **PPTX → PDF conversion**: After generating the PPTX blob with pptxgenjs, we can offer PDF as an alternative by converting the PPTX blob. Since client-side PPTX-to-PDF is not natively supported, the most practical approach is:
  - Generate the PPTX as a Blob (pptxgenjs supports `.write('blob')` instead of `.writeFile()`)
  - For PDF: use a different generation path — render each slide as a PDF page using `@react-pdf/renderer` or `jspdf`, replicating the slide layout

  **However**, a simpler and more reliable approach: add a toggle in the modal UI. For PDF, we generate the PPTX normally and inform the user that PowerPoint or Google Slides can export to PDF. Or we use `pptxgenjs` to generate the file and then offer both formats.

  **Recommended approach**: Since the project already uses `@react-pdf/renderer`, create a `generateDealhubPdf.ts` that renders the catalog slides as PDF pages with the same layout (background image, title, financial data, CTA). This gives a native PDF without conversion.

**Files to modify/create**:
- `src/features/operations-management/utils/generateDealhubPdf.ts` — new file, generates PDF version of the catalog using `@react-pdf/renderer`
- `src/features/operations-management/components/GenerateDealhubModal.tsx` — add format selector (PPTX / PDF)
- `src/features/operations-management/utils/generateDealhubPptx.ts` — add mailto hyperlink to CTA

### Technical details

**Hyperlink** (pptxgenjs API):
```typescript
slide.addText(ctaText, {
  // ...existing options...
  hyperlink: { url: 'mailto:lluis@capittal.es' },
});
```

**PDF generation**: Will create a React-PDF document component that renders each operation slide as a PDF page with the same visual structure (background, title, info rows, financial data, CTA with mailto link, footer). The modal will have a simple dropdown to pick format before generating.

