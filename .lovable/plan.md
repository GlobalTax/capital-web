

## Plan: Add "Aplicar a todas" and "Aplicar a restantes" buttons to PresentationsStep

### What it does
Adds two new buttons in the presentations summary bar that let you pick one uploaded presentation and assign it to multiple companies at once:
- **Aplicar a todas**: Assigns the selected presentation to ALL companies in the campaign (overwrites existing assignments)
- **Aplicar a restantes**: Assigns the selected presentation only to companies that don't have a presentation yet

### How it works
The user selects a presentation from a dropdown, then clicks one of the two buttons. The system creates `campaign_presentations` records for each target company, all pointing to the same storage file.

### Technical Changes

**File: `src/components/admin/campanas-valoracion/steps/PresentationsStep.tsx`**

1. Add state for the selected "template" presentation (`selectedBulkPresentationId`)
2. Add a presentation picker dropdown (select from uploaded presentations) in the summary bar
3. Add two buttons:
   - "Aplicar a todas" — for each company, upsert a `campaign_presentations` record with the same `file_name` and `storage_path` as the selected presentation, status `assigned`, `assigned_manually: true`
   - "Aplicar a restantes" — same but only for companies that don't already have an assigned presentation
4. Both buttons disabled when no presentation is selected or when there are no companies

**File: `src/hooks/useCampaignPresentations.ts`**

Add a new mutation `bulkAssignPresentation` that:
- Takes `presentationId`, `companyIds: string[]`
- Reads the source presentation's `file_name` and `storage_path`
- For each company, upserts a record in `campaign_presentations` with `campaign_id`, `company_id`, `file_name`, `storage_path`, `status: 'assigned'`, `assigned_manually: true`, `match_confidence: 1.0`
- Uses batch upsert (single `.upsert()` call with array) for efficiency
- Invalidates the query cache on success

### UI Layout
The two buttons and the presentation picker will appear in the existing summary bar, next to the "Asignar con IA" button:

```text
[3 archivos subidos] [2 asignadas] [1 sin asignar]    [Picker ▾] [Aplicar a todas] [Aplicar a restantes] [Asignar con IA]
```

