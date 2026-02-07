

# Knowledge Base: /admin/contacts (Leads Management Module)

## What It Is

Internal panel for the Capittal team to manage incoming leads from various forms. The team reviews, classifies, and tracks leads through a complete lifecycle: reception, review, classification, and follow-up.

---

## Architecture Overview

The module lives in two main locations:

```text
src/components/admin/contacts-v2/   <-- Active system (V2)
  ContactsLayout.tsx                <-- Main layout (CSS Grid: auto/auto/1fr)
  ContactsHeader.tsx                <-- Tabs + bulk actions
  ContactsFilters.tsx               <-- Filter bar + stats row
  VirtualContactsTable.tsx          <-- Virtualized list (react-window)
  ContactRow.tsx                    <-- Single row (memoized)
  hooks/useContacts.ts              <-- Data fetching + filtering + realtime
  types.ts                          <-- Type definitions
  index.ts                          <-- Barrel exports

src/components/admin/contacts/      <-- Shared components (used by V2)
  ContactDetailSheet.tsx            <-- Slide-over detail panel
  BulkStatusSelect.tsx              <-- Bulk status change
  BulkChannelSelect.tsx             <-- Bulk channel change
  BulkLeadFormSelect.tsx            <-- Bulk form assignment
  BulkDateSelect.tsx                <-- Bulk date change
  LeadFavoriteButton.tsx            <-- Star toggle (favorites)
  StatusesEditor.tsx                <-- Status CRUD panel
  pipeline/                         <-- Kanban pipeline view

src/features/contacts/              <-- Domain layer
  hooks/useContactActions.ts        <-- Bulk delete/archive actions
  hooks/useContactSelection.ts      <-- Selection state management
  components/stats/                 <-- Stats panel

src/pages/admin/ContactsPage.tsx    <-- Route entry point
src/hooks/useContactStatuses.ts     <-- Status config (DB-driven)
src/hooks/useInlineUpdate.ts        <-- Inline field editing
src/hooks/useCorporateFavorites.ts  <-- Favorites management
```

---

## Data Sources

The hook `useContacts.ts` fetches from **5 Supabase tables** in parallel:

| Table | Origin key | Description |
|-------|-----------|-------------|
| `contact_leads` | `contact` | Commercial contact form |
| `company_valuations` | `valuation` | Valuation calculator leads |
| `collaborator_applications` | `collaborator` | Collaborator applications |
| `acquisition_leads` | `acquisition` | Acquisition interest leads |
| `advisor_valuations` | `advisor` | Advisor valuation leads |

All tables share these join patterns:
- `empresas:empresa_id(nombre, facturacion)` -- linked company
- `acquisition_channel:acquisition_channel_id(name)` -- marketing channel
- `lead_form_ref:lead_form(name)` -- source form name

Records with `is_deleted = true` are excluded. Leads whose `lead_status_crm` matches a prospect stage (`is_prospect_stage = true` in `contact_statuses`) are also excluded from this view (they appear in the Prospects module instead).

---

## Unified Contact Type

```typescript
interface Contact {
  id: string;
  origin: 'contact' | 'valuation' | 'collaborator' | 'acquisition' | 'advisor';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
  lead_received_at?: string;
  status: string;
  lead_status_crm?: string;       // Dynamic status from contact_statuses table
  assigned_to?: string;
  empresa_id?: string;
  empresa_nombre?: string;
  empresa_facturacion?: number;
  acquisition_channel_id?: string;
  acquisition_channel_name?: string;
  lead_form?: string;             // FK to lead_forms table
  lead_form_name?: string;        // Resolved form name
  industry?: string;
  revenue?: number;
  ebitda?: number;
  final_valuation?: number;
  priority?: 'hot' | 'warm' | 'cold';
  is_from_pro_valuation?: boolean;
  email_sent?: boolean;
  email_opened?: boolean;
  apollo_status?: string;
  ai_sector_pe?: string;
  ai_sector_name?: string;
}
```

---

## Status System

Statuses are managed via the `contact_statuses` DB table (not hardcoded). Key fields:

| Field | Purpose |
|-------|---------|
| `status_key` | Unique text identifier (stored in `lead_status_crm` column) |
| `label` | Display name |
| `color` | Color key (maps to `STATUS_COLOR_MAP` in `useContactStatuses.ts`) |
| `is_active` | Shows in dropdowns |
| `is_visible` | Shows as Kanban column in Pipeline view |
| `is_prospect_stage` | Leads with this status go to Prospects module, not Contacts |
| `position` | Sort order |
| `is_system` | Cannot be deleted |

The `lead_status_crm` column is TEXT across all tables to support dynamic user-defined statuses.

Hook: `useContactStatuses` (30s staleTime, refetchOnWindowFocus).

---

## UI Tabs

| Tab | Component | Description |
|-----|-----------|-------------|
| Favoritos | `VirtualContactsTable` | Filtered to favorited leads only |
| Todos | `VirtualContactsTable` | All leads (directory view) |
| Pipeline | `ContactsPipelineView` | Kanban board by status |
| Stats | `ContactsStatsPanel` | Analytics dashboard |

---

## Table Layout (11 columns)

Grid: `grid-cols-[2fr_1.5fr_90px_1fr_1fr_100px_100px_80px_80px_1fr_80px]`

| # | Column | Field | Notes |
|---|--------|-------|-------|
| 1 | Nombre | `name` + `email` | Includes favorite star button |
| 2 | Empresa | `empresa_nombre` or `company` | Linked company preferred |
| 3 | Telefono | `phone` | 90px fixed |
| 4 | Estado | `lead_status_crm` | Rendered via `LeadStatusBadge` |
| 5 | Canal | `acquisition_channel_name` | Color-coded badge |
| 6 | Formulario | `lead_form_name` | Source form |
| 7 | Sector | `industry` or `ai_sector_name` | AI classification fallback |
| 8 | Facturacion | `revenue` or `empresa_facturacion` | Right-aligned, formatted |
| 9 | EBITDA | `ebitda` | Right-aligned, formatted |
| 10 | Fecha | `lead_received_at` | Editable inline via `EditableDateCell` |
| 11 | Valoracion | `final_valuation` | Right-aligned, formatted |

Row height: 40px fixed. Virtualized with `react-window` (`FixedSizeList`).

---

## Available Filters

| Filter | Type | Field |
|--------|------|-------|
| Search | Text input | name, email, company |
| Origen | Dropdown | `origin` (valuation, contact, etc.) |
| Estado | Dropdown (dynamic) | `lead_status_crm` (from `contact_statuses`) |
| Tipo | Dropdown | PRO vs Standard valuation |
| Fecha | Popover + presets | `created_at` range |
| Facturacion | Popover + presets | `revenue`/`empresa_facturacion` min/max |
| EBITDA | Popover + presets | `ebitda` min/max |
| Formulario | Dropdown | `lead_form` (from loaded contacts) |

---

## Bulk Actions (when rows selected)

- Archivar (soft delete)
- Cambiar Estado (BulkStatusSelect)
- Cambiar Canal (BulkChannelSelect)
- Asignar Formulario (BulkLeadFormSelect)
- Cambiar Fecha (BulkDateSelect)
- Sync a Brevo (email marketing)

---

## Realtime

Subscribed to `postgres_changes` on `contact_leads` and `company_valuations` tables. Any change triggers a full refetch + cross-invalidation of `['prospects']` query.

---

## Key Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useContacts` | `contacts-v2/hooks/` | Fetch, filter, stats, realtime |
| `useContactStatuses` | `src/hooks/` | Status CRUD, color map |
| `useContactSelection` | `features/contacts/hooks/` | Row selection state |
| `useContactActions` | `features/contacts/hooks/` | Bulk soft/hard delete |
| `useCorporateFavorites` | `src/hooks/` | Favorite lead IDs |
| `useContactInlineUpdate` | `src/hooks/` | Inline field save |
| `useBrevoSync` | `src/hooks/` | Email marketing sync |

---

## Design Standards

- Row height: 40px
- Button height: h-7
- Text: text-xs (11-12px)
- Stats bar: py-0.5, gap-1
- Density: high (compact admin UI)
- Filters: gap-2 between buttons
- All badge sizes: h-4 or h-5, text-[10px]

