

## Change ROD catalog CTA from mailto to marketplace form link

### What changes

Replace `mailto:lluis@capittal.es` hyperlinks in the generated PPTX and PDF catalogs with a URL pointing to the operation's contact form in the marketplace: `https://capittal.es/oportunidades?operation={operationId}`.

This way, when a recipient clicks "Más Información →" on any operation slide, they land on the marketplace page with the operation-specific inquiry form (same as shown in the screenshot).

### Files to modify

**1. `src/features/operations-management/utils/generateDealhubPptx.ts`** (~line 412)
- Change `hyperlink: { url: 'mailto:lluis@capittal.es' }` to `hyperlink: { url: \`https://capittal.es/oportunidades?operation=${op.id}\` }`
- The `op` object (type `Operation`) is already available in `addOperationSlide()`, which has `op.id`

**2. `src/features/operations-management/utils/generateDealhubPdf.tsx`** (~lines 454, 511)
- Change `<Link src="mailto:lluis@capittal.es">` to `<Link src={\`https://capittal.es/oportunidades?operation=${op.id}\`}>`
- Need to ensure the `op.id` is passed through to the relevant PDF components (operation slide and closing page)

### Technical detail

The marketplace already handles `?operation=` query param to auto-open the `OperationContactForm` modal for that specific operation, so no changes needed on the frontend page.

