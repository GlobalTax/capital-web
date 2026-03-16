

## Plan: Add valuation + financial filters across all campaign steps

### Current state
Each campaign step has different levels of filtering:

| Step | Search | Revenue/EBITDA filter | Valuation filter | Sort | Status filters |
|------|--------|----------------------|-----------------|------|---------------|
| CompaniesStep (Paso 2) | ✅ | ✅ | N/A | ✅ | — |
| ReviewCalculateStep (Paso 4) | ✅ | ✅ | ❌ | ✅ | — |
| ProcessSendStep (Paso 7) | ✅ | ✅ | ❌ | ✅ | ✅ |
| FollowUpStep (Paso 8) | ✅ | ✅ | ❌ | ✅ | ✅ |
| CampaignSummaryStep (Paso 9) | ✅ | ❌ | ❌ | ❌ | ✅ |
| DocumentSendStep | ✅ | ❌ | N/A | ❌ | — |

### Changes

**1. Extend `SortableHeader` to support `valuation_central`**
- Change `SortField` type from `'revenue' | 'ebitda' | null` to `'revenue' | 'ebitda' | 'valuation_central' | null`
- Update `applySortToList` generic constraint to include `valuation_central`

**2. ReviewCalculateStep — add Valoración filter + sort**
- Add `filterValuation` state (FinancialFilterValue)
- Add `<FinancialFilter label="Valoración" ...>` next to existing Revenue/EBITDA filters
- Filter by `matchesCustomRange(c.valuation_central, filterValuation)`
- Add `<SortableHeader>` for valuation_central column

**3. ProcessSendStep — add Valoración filter + sort**
- Same pattern: add `filterValuation` + FinancialFilter + matchesCustomRange on `valuation_central`
- Add sortable header for valuation column

**4. FollowUpStep (SendList) — add Valoración filter**
- Add `filterValuation` state + FinancialFilter + filter logic on `valuation_central`

**5. CampaignSummaryStep — add Revenue, EBITDA, Valoración filters + sort**
- Add FinancialFilter imports and states for revenue, ebitda, valuation_central
- Add sort state + SortableHeader on financial columns
- Apply filtering in the existing `filteredCompanies` memo

**6. DocumentSendStep — add Revenue/EBITDA filters + sort**
- Add FinancialFilter for revenue and ebitda
- Add sort support
- These columns would need to be shown in the table (currently the table might not show them — will check and add if needed)

### Files changed
- `src/components/admin/campanas-valoracion/shared/SortableHeader.tsx` — extend SortField type
- `src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx` — add valuation filter
- `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` — add valuation filter
- `src/components/admin/campanas-valoracion/steps/FollowUpStep.tsx` — add valuation filter
- `src/components/admin/campanas-valoracion/steps/CampaignSummaryStep.tsx` — add all financial filters + sort

