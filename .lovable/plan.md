

## Fix: "Ver en CRM" enlace roto en emails de notificación

### Problema
El email de notificación genera un enlace como:
`/admin/contacts/bf2f13da-cddd-4013-bb19-6d6572f0469f`

Pero `LeadDetailPage` espera el formato `origin_uuid`:
`/admin/contacts/contact_bf2f13da-cddd-4013-bb19-6d6572f0469f`

Sin el prefijo `contact_`, la página no sabe en qué tabla buscar y muestra "Lead no encontrado".

### Cambios

**1. Edge Function: `supabase/functions/send-form-notifications/index.ts`** (línea 1371)

Añadir el prefijo `contact_` al construir el CRM link, ya que `upsertLeadFromForm` siempre escribe en `contact_leads`:

```typescript
const crmLink = leadId
  ? `https://capittal.es/admin/contacts/contact_${leadId}`
  : 'https://capittal.es/admin/crm';
```

**2. Fallback en `src/pages/admin/LeadDetailPage.tsx`** (líneas 89-91)

Para emails ya enviados con URLs sin prefijo, añadir un fallback: si el ID no contiene `_` (no tiene prefijo), asumir origen `contact` y buscar en `contact_leads`. Si no se encuentra, probar en `company_valuations`.

```typescript
const parts = id.split('_');
let origin: string;
let leadId: string;

if (parts.length < 2 || !['contact','valuation','collaborator','general','acquisition','company_acquisition'].includes(parts[0])) {
  // ID sin prefijo — fallback a contact
  origin = 'contact';
  leadId = id;
} else {
  origin = parts[0];
  leadId = parts.slice(1).join('_');
}
```

Dos cambios pequeños. Los emails futuros llevarán el prefijo correcto, y los antiguos seguirán funcionando gracias al fallback.

