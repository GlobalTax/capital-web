

## Diagnosis: Why "Opened" status never appears

**Root cause**: All 3 sent campaign emails have `email_message_id = NULL` and `delivery_status = 'pending'`. This means the emails were sent **before** the tracking code was deployed to the `send-campaign-outbound-email` function.

Evidence from the database:
```
campaign_emails (status = 'sent'):
- email_message_id: NULL  ← Resend ID never stored
- email_opened: false     ← Can't match opens
- delivery_status: pending ← Never updated to 'sent'
```

Meanwhile, the `resend-webhook` IS working (signature verified, processing events), but it matches by `email_message_id` — which is NULL, so updates silently fail.

The tracking pixel embedded in emails uses `email.id` as fallback `mid`, and `email-open` has a fallback matching by `id`. But if the function wasn't deployed when those emails were sent, no pixel was embedded either.

---

## Fix Plan

### 1. Redeploy edge functions
The code is correct but needs redeployment so all future sends:
- Store Resend message ID in `email_message_id`
- Set `delivery_status = 'sent'` on send
- Embed tracking pixel in HTML body

Functions to redeploy:
- `send-campaign-outbound-email` (tracking pixel + message ID capture)
- `email-open` (campaign table support)

### 2. Backfill existing sent emails (SQL migration)
For the 3 already-sent emails with `delivery_status = 'pending'`, update them to `'sent'` so the UI shows "Enviado" correctly instead of "Pendiente":

```sql
UPDATE campaign_emails 
SET delivery_status = 'sent' 
WHERE status = 'sent' AND delivery_status = 'pending';
```

### 3. Add auto-refresh polling for tracking data
Currently the UI only shows tracking status on page load. Add a polling interval (every 30s) to the `useCampaignEmails` hook so open/delivery statuses update in near-real-time without manual refresh.

### 4. Verify Resend webhook configuration
The webhook is already receiving events (`email.delivered`, `email.clicked`). Need to ensure `email.opened` events are also subscribed in the Resend dashboard. The `resend-webhook` already handles `email.opened` → sets `email_opened = true`.

---

## Summary of changes

| File | Change |
|------|--------|
| SQL migration | Backfill `delivery_status = 'sent'` for existing sent emails |
| `useCampaignEmails.ts` | Add `refetchInterval: 30000` for polling |
| `useFollowupSequences.ts` | Add same polling for follow-up tracking |
| Edge functions | Redeploy `send-campaign-outbound-email` and `email-open` |

After this, all future sends will track opens/delivery in real-time, and the UI column "Entrega" will update automatically.

