

## Plan: Upgrade "Asignar con IA" to Use AI Gateway

### Current State
The assignment UI, manual dropdowns, badges, counters, and progress bars are **already fully implemented**. The "Asignar con IA" button currently uses client-side Jaccard similarity, which works but may miss matches that an LLM would catch (e.g. abbreviations, reordered words).

### Problem
The prompt requests Claude API for matching. There is **no ANTHROPIC_API_KEY** in secrets. However, **LOVABLE_API_KEY** is available, which provides access to Gemini/GPT models via the Lovable AI Gateway — same capability, already provisioned.

### Changes

**1. New Edge Function: `supabase/functions/match-presentations/index.ts`**
- Receives: `{ extractedName: string, companies: { id, name, cif }[] }`
- Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with a prompt asking it to return `{ company_id, confidence }` using tool calling for structured output
- Returns the match result as JSON
- Includes CORS headers, error handling for 429/402

**2. Update `supabase/config.toml`**
- Add `[functions.match-presentations]` with `verify_jwt = false`

**3. Update `src/hooks/useCampaignPresentations.ts`**
- In `autoMatchMutation`: replace the client-side `findBestMatch()` call with a `supabase.functions.invoke('match-presentations', ...)` call per unassigned file
- Keep the same threshold logic: if `confidence >= 0.75` → assign, else leave unassigned
- Keep progress tracking as-is
- **Fallback**: If the edge function fails for a file, fall back to client-side Jaccard matching

**4. No UI changes needed** — PresentationsStep.tsx already has all the required UI elements.

### Files Affected
- `supabase/functions/match-presentations/index.ts` (new)
- `supabase/config.toml` (add function entry)
- `src/hooks/useCampaignPresentations.ts` (swap matching logic)

### Not Touched
- Upload logic, PresentationsStep UI, other phases, matchPresentationToCompany.ts (kept as fallback)

