

## Plan: PDF generation + lead logging on "Descargar informe PDF"

### Summary
Add a `generatePDF` function using jspdf (already installed) that creates a 4-page PDF and wire it to the download button in StepTwo. After download: button turns green, stepper advances to step 3, lead data is logged to console.

### Changes in `src/pages/LandingCalculadoraAsesorias.tsx`

**1. Add jspdf import** at top of file:
```typescript
import jsPDF from 'jspdf';
```

**2. Add `generateValuationPDF` function** (~200 lines, after `fmtEurShort`):
- Receives `result`, `form`, `contact` as params
- Creates 4-page PDF using jsPDF with Helvetica (built-in, no font issues):

  **Page 1 — Cover**: Navy rect full page, gold line top, "CONFIDENCIAL" in gold, "Informe de Valoración" large white, firm name + location, date, "Capittal" branding + contact at bottom

  **Page 2 — Valuation**: Header bar navy with "CAPITTAL | INFORME DE VALORACIÓN | CONFIDENCIAL", valuation range large, metrics table (multiple, margin, equity) on gray bg, user data table (services, location, employees, revenue, EBITDA, margin, recurrence, growth, debt, clients), factors list with colored dots

  **Page 3 — Market Context**: "CONTEXTO DE MERCADO · 2025–2026" in gold, 3 paragraphs about PE consolidation, 6-row buyer table (Afianza/BlackRock, Auren/Waterland, Asenza/Ufenau, Adlanter/Artá, Grant Thornton/New Mountain, ETL Global/KKR), conclusion on multiples

  **Page 4 — Next Steps**: 4 numbered steps with descriptions, gold separator, contact details (Ausiàs March 36, 08010 Barcelona, 934 593 600, samuel@capittal.es, capittal.es), legal disclaimer

- Returns and triggers download as `Valoracion_[FirmName]_Capittal.pdf`

**3. Update StepTwo component**:
- Add `downloaded` state (boolean)
- Add `onDownloaded` callback prop to notify parent
- Validate name + email before enabling download button
- On click: generate PDF, download, set `downloaded=true`, call `onDownloaded(contact)`
- Show green "✓ PDF descargado" button when downloaded

**4. Update main component**:
- Add `handleDownloaded(contact)` that:
  - Advances stepper to step 3
  - Logs JSON to console with all lead data + timestamp
  - Adds `// TODO: connect webhook to send lead data to CRM/Supabase`
- Pass `onDownloaded` to StepTwo

**5. Update Stepper `onStepClick`** to allow clicking step 2 when on step 3.

### Files modified
- `src/pages/LandingCalculadoraAsesorias.tsx` only (no new files needed)

