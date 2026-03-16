

## Plan: Remove internal recipient guardrail for testing

The error occurs because `send-valuation-email` checks if the lead email exists in `email_recipients_config` and blocks sending. Since you're testing, we'll remove this guardrail entirely — it's overly restrictive and prevents legitimate internal testing.

### Change

**File: `supabase/functions/send-valuation-email/index.ts` (lines 544-552)**

Remove the guardrail block that throws "Lead email cannot be in internal recipients". Instead, just log a warning when a lead email matches an internal recipient, but allow the send to proceed.

```typescript
// Before: throws error blocking the send
// After: logs warning and continues
if (leadEmail) {
  const leadInRecipients = internalRecipients.some(
    email => email.toLowerCase() === leadEmail.toLowerCase()
  );
  if (leadInRecipients) {
    log('warn', 'LEAD_IS_INTERNAL_RECIPIENT', { email: leadEmail });
    // Remove lead from CC list to avoid duplicate
    internalRecipients = internalRecipients.filter(
      email => email.toLowerCase() !== leadEmail.toLowerCase()
    );
  }
}
```

This way internal emails can receive valuations for testing, while still avoiding sending them a duplicate CC copy.

