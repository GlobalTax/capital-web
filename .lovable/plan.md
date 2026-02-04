
# Plan: Sincronización Automática Leads ↔ Prospectos

## Causa Raíz

El módulo `/admin/contacts` (Gestión de Leads) usa `useUnifiedContacts` que **no filtra por estado** - muestra todos los leads independientemente de su estado CRM. Mientras tanto, `/admin/prospectos` sí filtra correctamente leads con estados marcados como `is_prospect_stage = true`.

**Resultado actual**: Un lead con estado "PSH Enviada" aparece en **AMBAS** vistas.

## Regla de Negocio a Implementar

| Vista | Condición de filtro |
|-------|---------------------|
| **Gestión de Leads** | `lead_status_crm NOT IN (estados con is_prospect_stage = true)` |
| **Gestión de Prospectos** | `lead_status_crm IN (estados con is_prospect_stage = true)` |

Estados actuales configurados como prospecto:
- `fase0_activo` → "Reunión Programada"  
- `archivado` → "PSH Enviada"

## Cambios a Implementar

### 1. Backend: Single Source of Truth (ya implementado parcialmente)

La lógica de negocio ya está en `contact_statuses.is_prospect_stage`. Solo necesitamos consumirla correctamente en el frontend.

### 2. Hook `useUnifiedContacts.tsx` - Excluir estados de prospecto

Modificar la función `fetchUnifiedContacts` para:

1. Obtener primero los `prospectStatusKeys` de `contact_statuses`
2. Añadir filtro `.not('lead_status_crm', 'in', prospectStatusKeys)` a cada query

```typescript
// Dentro de fetchUnifiedContacts:
// 1. Obtener status keys de prospecto
const { data: prospectStatuses } = await supabase
  .from('contact_statuses')
  .select('status_key')
  .eq('is_prospect_stage', true)
  .eq('is_active', true);

const prospectStatusKeys = (prospectStatuses || []).map(s => s.status_key);

// 2. Aplicar filtro a cada tabla (si hay prospect keys)
// Para company_valuations:
let valuationsQuery = supabase
  .from('company_valuations')
  .select('...')
  .is('is_deleted', false);

if (prospectStatusKeys.length > 0) {
  valuationsQuery = valuationsQuery.not('lead_status_crm', 'in', `(${prospectStatusKeys.join(',')})`);
}
```

### 3. Invalidación de Cache Cruzada

Los hooks `useContactUpdate` y `useBulkUpdateStatus` ya invalidan `['prospects']`. Necesitamos asegurar que también se invalide correctamente `['unified-contacts']` con refetch inmediato cuando el estado cambia hacia/desde un estado de prospecto.

```typescript
// En useBulkUpdateStatus.ts y useContactUpdate.ts
onSuccess: () => {
  // Invalidar AMBAS queries con refetch inmediato
  queryClient.invalidateQueries({ queryKey: ['unified-contacts'] });
  queryClient.invalidateQueries({ queryKey: ['prospects'] });
}
```

### 4. Realtime Subscription para Leads

Añadir suscripción realtime en `useUnifiedContacts` similar a la de `useProspects` para que cuando un lead cambie de estado, la lista se actualice automáticamente:

```typescript
// Dentro de useUnifiedContacts
useEffect(() => {
  const channel = supabase
    .channel('leads-status-sync')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'company_valuations',
    }, (payload) => {
      // Si el status cambió, refetch
      if (payload.new?.lead_status_crm !== payload.old?.lead_status_crm) {
        refetch();
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useUnifiedContacts.tsx` | Añadir filtro que excluye estados de prospecto + suscripción realtime |
| `src/hooks/useContactUpdate.ts` | Asegurar invalidación inmediata de ambas queries |
| `src/hooks/useBulkUpdateStatus.ts` | Asegurar invalidación inmediata de ambas queries |

## Flujo Esperado Después de la Implementación

```text
┌─────────────────────────────────────────────────────────────────┐
│                    contact_statuses (DB)                        │
│  status_key='nuevo'         → is_prospect_stage=false           │
│  status_key='fase0_activo'  → is_prospect_stage=true  ◄─────┐  │
│  status_key='archivado'     → is_prospect_stage=true  ◄─────┤  │
└───────────────────────────────────────────────────────────────│─┘
                                                                │
                                                                │
           ┌──────────────────┐    Usuario cambia    ┌─────────┴─────────┐
           │   Gestión de     │      estado a        │   Gestión de       │
           │     Leads        │  "Reunión Programada"│    Prospectos      │
           │ (/admin/contacts)│   ─────────────────► │ (/admin/prospectos)│
           │                  │                      │                    │
           │ Muestra leads    │   ◄───────────────── │ Muestra leads      │
           │ con is_prospect_ │  Usuario cambia      │ con is_prospect_   │
           │ stage = false    │  estado a "Nuevo"    │ stage = true       │
           └──────────────────┘                      └────────────────────┘
                     │                                         │
                     └─────────────────────────────────────────┘
                           Invalidación cruzada de cache
                         (ambas listas se actualizan al instante)
```

## Casos de Prueba

| # | Acción | Resultado Esperado |
|---|--------|-------------------|
| A | En `/admin/contacts`, cambiar un lead a "PSH Enviada" | Lead desaparece de Contacts, aparece en Prospectos |
| B | En `/admin/contacts`, cambiar un lead a "Reunión Programada" | Lead desaparece de Contacts, aparece en Prospectos |
| C | En `/admin/prospectos`, cambiar lead a "Nuevo" | Lead desaparece de Prospectos, aparece en Contacts |
| D | Refresh de ambas páginas | La pertenencia es correcta según estado en DB |
| E | Cambio de estado desde ficha del lead | Se replica en ambas listas |

## Sección Técnica

### Filtro SQL en Supabase

El cliente de Supabase no soporta directamente `NOT IN` con arrays. La implementación usa:

```typescript
// Opción 1: Filtrar en cliente (más simple, menos eficiente)
const filteredData = data.filter(lead => 
  !prospectStatusKeys.includes(lead.lead_status_crm)
);

// Opción 2: Múltiples .neq (verbose pero funciona en DB)
let query = supabase.from('company_valuations').select('*');
prospectStatusKeys.forEach(key => {
  query = query.neq('lead_status_crm', key);
});

// Opción 3: RPC con SQL puro (más eficiente para muchos estados)
// Crear una RPC get_leads_excluding_prospects()
```

Para simplicidad y consistencia con el código existente, usaremos **Opción 1** (filtro en cliente) ya que:
- El volumen de datos es manejable
- Mantiene consistencia con el enfoque actual de `useUnifiedContacts`
- Evita cambios en la base de datos

### Invalidación Optimizada

```typescript
// Patrón actual (refetchType: 'none')
queryClient.invalidateQueries({
  queryKey: ['unified-contacts'],
  refetchType: 'none', // No refetch inmediato
});

// Cambiar a refetch inmediato cuando cambia status hacia/desde prospecto
queryClient.invalidateQueries({
  queryKey: ['unified-contacts'],
  // Sin refetchType = refetch inmediato por defecto
});
```

### Subscripción Realtime Compartida

Para evitar múltiples conexiones websocket, considerar crear un hook compartido `useLeadStatusSync` que gestione la suscripción central para ambos módulos.
