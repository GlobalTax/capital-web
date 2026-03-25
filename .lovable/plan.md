

## Fix: Campos de estado/canal/formulario no se persisten en la UI para leads "legacy"

### Causa raíz

El hook `useContacts.ts` tiene dos problemas para leads de `general_contact_leads` y `sell_leads`:

1. **Query sin joins**: La consulta a `general_contact_leads` es `select('*')` — no incluye joins para `acquisition_channel` ni `lead_form_ref`, a diferencia de las otras tablas.

2. **Transformación incompleta**: La función `transformLegacyLead` (línea 432-449) **no mapea** los campos `acquisition_channel_id`, `acquisition_channel_name`, `lead_form`, `lead_form_name`, ni `lead_form_display_name`. Solo mapea `id`, `name`, `email`, `phone`, `company`, `status`, `lead_status_crm`, y campos de email.

**Resultado**: Los cambios se guardan correctamente en la BD, pero cuando `fetchContacts()` se ejecuta (por un evento realtime de otra tabla como `contact_leads`), la transformación descarta esos campos y la UI muestra los valores vacíos/antiguos.

### Solución

**`src/components/admin/contacts-v2/hooks/useContacts.ts`** — Dos cambios:

1. **Actualizar la query** de `general_contact_leads` (línea ~104) para incluir joins:
```typescript
supabase
  .from('general_contact_leads')
  .select('*, acquisition_channel:acquisition_channel_id(name), lead_form_ref:lead_form(name)')
  .order('created_at', { ascending: false }),
```

2. **Actualizar `transformLegacyLead`** (línea ~432) para incluir los campos faltantes:
```typescript
function transformLegacyLead(lead: any, sourceType, formDisplayMap): Contact {
  return {
    ...existing fields...,
    acquisition_channel_id: lead.acquisition_channel_id,
    acquisition_channel_name: lead.acquisition_channel?.name,
    lead_form: lead.lead_form,
    lead_form_name: lead.lead_form_ref?.name,
    lead_form_display_name: formDisplayMap[lead.lead_form] || lead.lead_form_ref?.name,
    revenue: lead.revenue ? Number(lead.revenue) : undefined,
    ebitda: lead.ebitda ? Number(lead.ebitda) : undefined,
    location: lead.location,
    industry: lead.industry,
  };
}
```

### Archivo afectado
- `src/components/admin/contacts-v2/hooks/useContacts.ts`

