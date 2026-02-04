
# Plan: Sincronización Automática Leads ↔ Prospectos

## Problema Actual

Cuando un lead cambia a estado "Reunión Programada" o "PSH Enviada" (estados con `is_prospect_stage: true`):
- ✅ Desaparece de la tabla de Leads (correcto)
- ❌ NO aparece inmediatamente en Prospectos (error)
- ❌ Requiere refrescar manualmente la página de Prospectos

## Causa Raíz

El hook `useContactInlineUpdate` (línea 425) solo invalida la query `['unified-contacts']`:

```typescript
queryClient.invalidateQueries({
  queryKey: ['unified-contacts'],
  refetchType: 'none',
});
```

Falta invalidar `['prospects']` y `['contacts-v2']` para que ambas vistas se actualicen.

## Solución: Cross-Invalidation

Cuando se actualiza `lead_status_crm`, invalidar todas las queries relacionadas:
- `['unified-contacts']` - Lista antigua de leads
- `['contacts-v2']` - Lista nueva de leads (tu sistema actual)
- `['prospects']` - Lista de prospectos

Además, verificar si el nuevo estado es un "prospect stage" para mostrar feedback visual al usuario.

## Cambios a Realizar

### Archivo 1: `src/hooks/useInlineUpdate.ts`

**Añadir invalidación cruzada cuando cambia `lead_status_crm`:**

```typescript
// Después de la actualización exitosa (línea 425)
// Invalidar queries de contacts
queryClient.invalidateQueries({
  queryKey: ['unified-contacts'],
  refetchType: 'none',
});

// NUEVO: Cross-invalidation para sincronizar Leads ↔ Prospectos
if (field === 'lead_status_crm') {
  queryClient.invalidateQueries({ queryKey: ['contacts-v2'] });
  queryClient.invalidateQueries({ queryKey: ['prospects'] });
  
  // Verificar si el nuevo estado es prospecto para feedback
  const { data: statusData } = await supabase
    .from('contact_statuses')
    .select('is_prospect_stage, label')
    .eq('status_key', value)
    .single();
  
  if (statusData?.is_prospect_stage) {
    toast.success(`Movido a Prospectos: ${statusData.label}`, { 
      duration: 3000,
      action: {
        label: 'Ver Prospectos',
        onClick: () => window.location.href = '/admin/prospectos',
      }
    });
  }
}
```

### Archivo 2: `src/components/admin/contacts-v2/hooks/useContacts.ts`

**Añadir invalidación cruzada en la suscripción Realtime:**

```typescript
// Línea 116-118: Añadir invalidación de prospects también
.on('postgres_changes', { event: '*', schema: 'public', table: 'contact_leads' }, () => {
  fetchContacts();
  queryClient.invalidateQueries({ queryKey: ['prospects'] });
})
.on('postgres_changes', { event: '*', schema: 'public', table: 'company_valuations' }, () => {
  fetchContacts();
  queryClient.invalidateQueries({ queryKey: ['prospects'] });
})
```

### Archivo 3: `src/hooks/useProspects.ts`

**Añadir invalidación cruzada en la suscripción Realtime (ya existe, pero verificar):**

El hook ya tiene suscripciones Realtime (líneas 55-113) que invalidan `['prospects']` cuando cambia el estado. Solo falta añadir invalidación de `['contacts-v2']`:

```typescript
// Dentro del callback de postgres_changes
queryClient.invalidateQueries({ queryKey: ['prospects'] });
queryClient.invalidateQueries({ queryKey: ['contacts-v2'] }); // NUEVO
```

## Estados de Prospecto Actuales

Según la base de datos, estos estados tienen `is_prospect_stage: true`:

| status_key | label | is_prospect_stage |
|------------|-------|-------------------|
| `fase0_activo` | Reunión Programada | ✅ true |
| `archivado` | PSH Enviada | ✅ true |

Cuando un lead se mueve a cualquiera de estos estados, automáticamente:
1. Desaparece de la tabla de Leads (`/admin/contacts`)
2. Aparece en la tabla de Prospectos (`/admin/prospectos`)

## Sección Técnica

### Flujo de Sincronización

```text
┌─────────────────────────────────────────────────────────────┐
│                    Usuario cambia estado                     │
│          (Pipeline drag, selector de estado, etc.)          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  useContactInlineUpdate                      │
│  1. Valida status_key existe en contact_statuses            │
│  2. Actualiza BD (company_valuations/contact_leads)         │
│  3. Cross-invalidation: contacts + prospects                │
│  4. Si is_prospect_stage → toast con link                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│   /admin/contacts       │     │    /admin/prospectos        │
│                         │     │                             │
│  useContacts refetch    │     │  useProspects refetch       │
│  (excluye prospects)    │     │  (solo is_prospect_stage)   │
└─────────────────────────┘     └─────────────────────────────┘
```

### Validación Pre-Guardado

El sistema ya valida (líneas 383-401) que el `status_key` existe en `contact_statuses` antes de guardar:

```typescript
if (field === 'lead_status_crm' && value) {
  const { data: statusData } = await supabase
    .from('contact_statuses')
    .select('status_key, is_active')
    .eq('status_key', value)
    .maybeSingle();
  
  if (!statusData) {
    throw new Error('El estado seleccionado no existe');
  }
}
```

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useInlineUpdate.ts` | Añadir cross-invalidation para prospects y contacts-v2 cuando cambia lead_status_crm |
| `src/components/admin/contacts-v2/hooks/useContacts.ts` | Añadir invalidación de prospects en suscripción Realtime |
| `src/hooks/useProspects.ts` | Añadir invalidación de contacts-v2 en suscripción Realtime |

## Resultado Esperado

1. Al cambiar estado a "Reunión Programada" o "PSH Enviada":
   - Lead desaparece de `/admin/contacts` instantáneamente
   - Lead aparece en `/admin/prospectos` instantáneamente
   - Toast muestra "Movido a Prospectos" con link para ver

2. Al cambiar estado desde Prospectos a un estado no-prospecto:
   - Lead desaparece de `/admin/prospectos` instantáneamente
   - Lead aparece en `/admin/contacts` instantáneamente

3. Sincronización bidireccional sin necesidad de refrescar la página
