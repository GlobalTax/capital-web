

## Plan: Estado por defecto "Nuevo"

El problema es que las funciones de transformación en `useContacts.ts` pasan `lead_status_crm` tal cual viene de la BD, y cuando es `null`/`undefined`, la columna "Estado" aparece vacía.

### Cambio

**Archivo**: `src/components/admin/contacts-v2/hooks/useContacts.ts`

En las 4 funciones de transformación, cambiar la asignación de `lead_status_crm` para que use `'nuevo'` como fallback:

- **`transformContact`** (línea 346): `lead.lead_status_crm` → `lead.lead_status_crm || 'nuevo'`
- **`transformValuation`** (línea 394): `lead.lead_status_crm` → `lead.lead_status_crm || 'nuevo'`
- **`transformAdvisor`**: añadir `lead_status_crm: lead.lead_status_crm || 'nuevo'` (actualmente no tiene este campo)
- **`transformLegacyLead`** (línea 466): `lead.lead_status_crm || null` → `lead.lead_status_crm || 'nuevo'`

Resultado: todos los leads sin estado asignado mostrarán "Nuevo" en vez de vacío.

