

## Bug: Pipeline only shows leads from one table

### Problem
The pipeline fetches leads exclusively from `company_valuations`, but leads also exist in `contact_leads` with CRM statuses. The "Ya advisor" column shows 0 because all 5 leads with that status are in `contact_leads`, not `company_valuations`.

Database evidence:
- `company_valuations` has 0 rows with `lead_status_crm = 'ya_advisor'`
- `contact_leads` has 5 rows with `lead_status_crm = 'ya_advisor'`
- `contact_leads` has 355 total leads with CRM statuses across all columns

### Fix

**`src/features/leads-pipeline/hooks/useLeadsPipeline.ts`**

Extend the query to also fetch leads from `contact_leads` and merge them into the pipeline dataset. Both tables share the same `lead_status_crm` field.

1. Add a second paginated query to `contact_leads` fetching the equivalent fields (`id`, `full_name` as `contact_name`, `company`, `email`, `phone`, `service_type` as `industry`, `lead_status_crm`, `created_at`, `assigned_to`)
2. Normalize both sources into the same `PipelineLead` shape, adding an `origin` field (`'valuation'` | `'contact'`) to distinguish them
3. Merge and deduplicate by email (prefer `company_valuations` if duplicate)
4. Update `updateStatus` and `assignLead` mutations to route updates to the correct table based on `origin`

**`src/features/leads-pipeline/types/index.ts`**

Add `origin` field to `PipelineLead` type.

**`src/features/leads-pipeline/components/PipelineCard.tsx`**

Update the detail navigation to route to the correct detail page based on `origin` (`/admin/valuations/:id` vs `/admin/contacts/:id`).

### Impact
All pipeline columns will show leads from both tables. "Ya advisor" will correctly show its 5 leads. Other columns will also gain any `contact_leads` entries that were previously invisible.

