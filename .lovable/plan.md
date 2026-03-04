

## Assignment Logic for "Presentaciones" — Review

The assignment functionality is **already implemented** from the previous approved plan. The current code includes:

- **Auto-match with IA** button, progress bar, and summary toast
- **Manual assignment** dropdowns with "Cambiar" button for reassignment  
- **Status badges** (IA green, Manual blue, Unassigned orange)
- **Counters** updated in real-time

### Only Change Needed

**`src/utils/matchPresentationToCompany.ts`** — line 75-77: Change threshold from `0.5` to `0.75`

```typescript
// Current (line 75):
companyId: bestScore > 0.5 ? bestId : null,
// Change to:
companyId: bestScore >= 0.75 ? bestId : null,

// Current (line 77):
status: bestScore > 0.5 ? 'assigned' : 'unassigned',
// Change to:
status: bestScore >= 0.75 ? 'assigned' : 'unassigned',
```

This is the only gap between the current implementation and the requirements in this prompt. Everything else (upload, table UI, manual assignment, delete with confirmation, progress bars, logging) is already in place.

