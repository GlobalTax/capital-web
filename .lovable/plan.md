

## Diagnosis: Open Tracking for Campaign Emails

The Resend dashboard shows "Opened" / "Delivered" / "Suppressed" statuses for campaign emails, but this data **never reaches your app**. Here's why and what to build:

### Current State
- `email-open` Edge Function exists but only tracks opens for CRM tables (`contact_leads`, `company_valuations`, `collaborator_applications`)
- `campaign_emails` and `campaign_followup_sends` lack tracking columns (`email_message_id`, `email_opened`, `email_opened_at`)
- `send-campaign-outbound-email` doesn't store Resend's message ID or embed a tracking pixel
- No Resend webhook is configured to push delivery/open events back to Supabase

### Plan

**1. Database: Add tracking columns**
- `campaign_emails`: add `email_message_id TEXT`, `email_opened BOOLEAN DEFAULT false`, `email_opened_at TIMESTAMPTZ`, `delivery_status TEXT DEFAULT 'pending'`
- `campaign_followup_sends`: add `email_message_id TEXT`, `email_opened BOOLEAN DEFAULT false`, `email_opened_at TIMESTAMPTZ`, `delivery_status TEXT DEFAULT 'pending'`

**2. Edge Function: `send-campaign-outbound-email`**
- After successful Resend send, parse the response to extract `id` (Resend message ID)
- Store it in `email_message_id` column alongside the `status: 'sent'` update
- Embed a tracking pixel `<img src="https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/email-open?mid={resend_message_id}">` in the HTML body

**3. Edge Function: `email-open`**
- Add `campaign_emails` and `campaign_followup_sends` to the list of tables it updates when a pixel is hit
- Match by `email_message_id`

**4. Resend Webhook (optional but recommended)**
- Create a new Edge Function `resend-webhook` to receive Resend webhook events (delivered, opened, bounced, complained)
- Update `delivery_status` in the corresponding table based on the event type
- This gives you "Delivered" / "Bounced" / "Suppressed" statuses in addition to pixel-based opens

**5. UI: Show open/delivery status in campaign steps**
- In **Step 7 (1r Envio)**, **Step 8 (Follow Up)** send lists, and **Step 9 (Analisis)**: add a column/badge showing delivery + open status
- Badges: "Delivered" green, "Opened" blue with eye icon, "Bounced" red, "Pending" gray
- In **Step 9 (Analisis)**: add open rate and delivery rate KPIs per stage

### Technical Notes
- Resend returns `{ id: "msg_xxx" }` on successful send - this is already available in the fetch response but currently discarded
- The tracking pixel approach works independently of Resend webhooks (belt + suspenders)
- Resend webhooks need a signing secret configured in Edge Function secrets

