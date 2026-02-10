

## Fix: Formularios Capittal no registran Leads en Gestion de Leads

### Problema diagnosticado

El flujo actual tiene dos problemas criticos:

1. **Tablas fragmentadas e invisibles**: Los formularios insertan datos en `sell_leads` (43 registros), `general_contact_leads` (21 registros) e `investor_leads` (39 registros), pero `/admin/contacts` solo consulta `contact_leads`, `company_valuations`, `collaborator_applications`, `acquisition_leads` y `advisor_valuations`. Resultado: **103+ leads invisibles**.

2. **`send-form-notifications` solo envia emails**: Esta Edge Function recibe los datos del formulario pero NO crea/actualiza ningún lead en la base de datos. Solo envia emails con un link generico `https://capittal.es/admin/crm` que no apunta a ningun lead especifico.

3. **Sin deduplicacion**: Si el mismo contacto envia multiples formularios, se crean registros duplicados sin vincular.

### Solucion (2 partes)

#### Parte 1: Edge Function `send-form-notifications` - Crear Lead antes de enviar email

Modificar la Edge Function para que, antes de enviar los emails:

1. **Deduplica por email** (normalizado a minusculas): busca si ya existe un `contact_leads` con ese email
2. Si existe: actualiza campos (empresa, telefono, mensaje) y registra un evento en `lead_activities`
3. Si no existe:
   - Upsert empresa en `empresas` (por nombre, creando si no existe)
   - Upsert contacto en `contactos` (por email, creando si no existe)
   - Inserta nuevo `contact_leads` con `empresa_id`, `lead_status_crm = 'nuevo'`, `canal`, `formulario`, datos financieros
4. Genera `leadId` real y lo usa en el link "Ver en CRM": `https://capittal.es/admin/contacts/${leadId}`
5. Si la creacion de lead falla: loguea el error completo pero **sigue enviando el email** (con link generico como fallback)
6. Datos financieros negativos (facturacion/EBITDA < 0): se guardan como NULL con nota en el campo `message` indicando el valor original

Flujo:

```text
Form submission llega
    |
    v
[Dedupe: buscar contact_leads por email]
    |
    +--> Existe? --> UPDATE + lead_activity "nueva solicitud"
    |
    +--> No existe? --> upsert empresas --> upsert contactos --> INSERT contact_leads
    |
    v
[leadId confirmado]
    |
    v
[Enviar emails con link: /admin/contacts/{leadId}]
    |
    v
[Respuesta OK]
```

#### Parte 2: Incluir `sell_leads` y `general_contact_leads` en el listado

Anadir estas dos tablas al fetch paralelo en `useContacts.ts` (hook de contacts-v2) para que los 64 leads historicos sean visibles inmediatamente. Se anadiran con `origin: 'general'` y se transformaran con el mismo patron que los demas.

**Nota sobre la memoria de proteccion**: Este cambio en `useContacts.ts` es minimo y aditivo (solo anade 2 queries mas al `Promise.all` y 2 `map()` al array `unified`). No modifica la logica existente de estados, filtros ni inline editing.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/send-form-notifications/index.ts` | Anadir logica de upsert lead/empresa/contacto antes de enviar emails. Actualizar link "Ver en CRM" con leadId real |
| `src/components/admin/contacts-v2/hooks/useContacts.ts` | Anadir fetch de `sell_leads` y `general_contact_leads` al Promise.all. Anadir transformadores |

### Detalles tecnicos

**Deduplicacion en la Edge Function:**
```typescript
// 1. Buscar lead existente por email
const { data: existingLead } = await supabase
  .from('contact_leads')
  .select('id')
  .eq('email', email.toLowerCase())
  .limit(1)
  .maybeSingle();

if (existingLead) {
  // Update + actividad
  await supabase.from('contact_leads').update({ ... }).eq('id', existingLead.id);
  await supabase.from('lead_activities').insert({ lead_id: existingLead.id, ... });
  leadId = existingLead.id;
} else {
  // Upsert empresa, contacto, insert lead
  const { data: newLead } = await supabase.from('contact_leads').insert({ ... }).select('id').single();
  leadId = newLead.id;
}
```

**Mapeo de formType a campos de contact_leads:**

| formType | canal | service_type | notas |
|----------|-------|-------------|-------|
| contact / general_contact | "web" | del formulario | mensaje |
| sell_lead | "web" | "vender" | mensaje |
| operation_contact | "marketplace" | "comprar" | operacion + mensaje |
| campaign_valuation | "campaña" | "valoracion" | CIF + financials |
| lead_magnet_download | "lead_magnet" | null | lead_magnet_id |

**Datos financieros negativos:**
- Si `revenue < 0` o `ebitda < 0`: se guardan como `NULL` en los campos numericos
- El valor original se anade al campo `message`: "Facturacion introducida: -500€ (valor sospechoso)"

**Visibilidad historica (useContacts.ts):**
```typescript
// Anadir al Promise.all existente:
supabase.from('sell_leads').select('*').order('created_at', { ascending: false }),
supabase.from('general_contact_leads').select('*').order('created_at', { ascending: false }),
```

### Criterios de aceptacion

1. Cada submission de formulario crea/actualiza un lead visible en `/admin/contacts`
2. No hay duplicados: mismo email = mismo lead actualizado
3. "Ver en CRM" del email apunta al lead real
4. Los 64 leads historicos en `sell_leads` + `general_contact_leads` aparecen en el listado
5. Si falla la creacion de lead, el email se envia igualmente (con link generico)
6. No se modifican estados, filtros ni logica de inline editing existente
