

## Plan: Add search to company assignment dropdown in Presentations

### Problem
The company assignment `<Select>` in `PresentationsStep.tsx` lists all companies without search. When campaigns have many companies, finding the right one is slow.

### Solution
Replace the plain `<Select>` with a searchable `Popover + Command` combo (combobox pattern) using the existing `cmdk`-based components from `src/components/ui/command.tsx`.

### Changes

**File: `src/components/admin/campanas-valoracion/steps/PresentationsStep.tsx`**

- Import `Popover`, `PopoverTrigger`, `PopoverContent` and `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` 
- Replace the `<Select>` block (lines 208-219) with a `Popover` containing a `Command` searchable list
- Track open state per presentation row via a `openPopover` state record (similar to `editingAssignment`)
- When a company is selected from the filtered list, update `manualAssignments` and close the popover
- Display the selected company name on the trigger button, or "Seleccionar empresa" as placeholder

### UI Behavior
- Click trigger → opens popover with search input auto-focused
- Type to filter companies by name
- Click a company → selects it, closes popover
- The confirm button (checkmark) remains unchanged

