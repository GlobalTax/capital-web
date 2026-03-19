

## New landing page: Multi-operation inquiry form

### What it does
A standalone landing page at `/lp/consulta-oportunidades` with a form where users can:
1. Select **multiple operations** from a dropdown/checklist of all active opportunities
2. Fill in their contact details (same fields as the existing form)
3. Submit one form covering all selected operations

The ROD catalog "Más información" buttons will link to this page (optionally pre-selecting a specific operation via query param).

### Files to create

**1. `src/pages/landing/LandingConsultaOportunidades.tsx`**
- Standalone page component at route `/lp/consulta-oportunidades`
- Fetches active operations from `company_operations` (where `is_active = true`, `is_deleted = false`)
- Multi-select checklist/dropdown showing operation `company_name` + `sector`
- Supports `?operation=<id>` query param to pre-select an operation
- Contact fields: Nombre, Empresa, Email, Teléfono, Mensaje (reusing same structure as `OperationContactForm`)
- On submit: inserts one `contact_leads` row per selected operation (reusing `submitOperationContactForm` logic) or a single row with all operation IDs in the referral field
- Honeypot + rate limiting (reuse existing utilities from `useContactForm`)
- Capittal branding, responsive design, consistent with existing landing pages

**2. Update `src/core/routing/AppRoutes.tsx`**
- Add route: `/lp/consulta-oportunidades` → `LandingConsultaOportunidades`

**3. Update `src/features/operations-management/utils/generateDealhubPptx.ts`**
- Change operation CTA hyperlink from `/oportunidades?operation=${op.id}` to `/lp/consulta-oportunidades?operation=${op.id}`

**4. Update `src/features/operations-management/utils/generateDealhubPdf.tsx`**
- Same URL change as PPTX

**5. Update closing slide URLs** in both generators to point to `/lp/consulta-oportunidades`

### Technical details

- Operations fetched via `supabase.from('company_operations').select('id, company_name, sector').eq('is_active', true).eq('is_deleted', false)`
- Multi-select UI: checkboxes within a scrollable list, grouped by sector
- Pre-selection from query param parsed with `useSearchParams`
- Submission creates a single `contact_leads` entry with `referral` = `operations_[id1,id2,id3]` and sends notification via existing `send-form-notifications` edge function
- Message field auto-populated with selected operation names

