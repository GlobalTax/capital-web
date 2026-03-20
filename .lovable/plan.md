

## Corregir KPI "Enviadas" para contar solo empresas con dato de entrega

### Problema actual
`sentCount` cuenta empresas con `status === 'sent'` O que estén en `emailSentMap` (tienen registro en `campaign_emails`). Pero el usuario quiere que cuente solo las que tienen un `delivery_status` real en la columna "Entrega" (no `null`, no `pending`).

### Cambio

**Archivo: `src/components/admin/campanas-valoracion/steps/CampaignSummaryStep.tsx`** — Línea 294

```tsx
// Antes:
const sentCount = companies.filter(c => c.status === 'sent' || emailSentMap.has(c.id)).length;

// Después:
const sentCount = companies.filter(c => {
  const tracking = emailTrackingMap.get(c.id);
  return tracking?.delivery_status && tracking.delivery_status !== 'pending';
}).length;
```

Esto cuenta solo empresas que tienen un `delivery_status` con valor real (`delivered`, `bounced`, `sent`, `opened`), que son exactamente las que muestran un badge en la columna "Entrega".

