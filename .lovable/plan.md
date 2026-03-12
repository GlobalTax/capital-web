

## Add email open tracking display to Document campaigns

### Problem
The tracking pixel is already embedded in outbound emails by the Edge Function, and the `useCampaignEmails` hook already returns `email_opened` and `delivery_status` fields. The `DocumentSendStep` simply doesn't display this information — it only shows "Enviado/Pendiente/Error" without delivery or open tracking.

### Changes (single file: `DocumentSendStep.tsx`)

1. **Add a "Entrega" column** to the table (between "Estado" and "Acciones") showing delivery/open status badges, matching the exact same pattern used in `ProcessSendStep`:
   - 📩 **Abierto** (emerald/blue badge) — when `email_opened === true`
   - ✓ **Entregado** (green badge) — when `delivery_status === 'delivered'`
   - ✗ **Rebotado** (red badge) — when `delivery_status === 'bounced'`
   - **—** for unsent emails

2. **Add stats card for "Abiertos"** — a 5th summary card showing the count of opened emails (where `email_opened === true`), replacing the current 4-card grid with a 5-card grid.

3. **Add polling note** — the hook already polls every 30s (`refetchInterval: 30000`), so open status updates automatically.

No backend or Edge Function changes needed — all tracking infrastructure is already in place.

