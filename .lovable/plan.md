
# Plan: Sincronización en Tiempo Real de Prospectos

## Diagnóstico Completado

### Causas Raíz Identificadas

#### 1. **Falta de Invalidación de Cache al Cambiar Estados**
Cuando se actualiza el estado de un lead en `/admin/contacts`:
- `useContactUpdate.ts` (líneas 212-223) invalida `['unified-contacts']` pero **NO invalida `['prospects']`**
- `useBulkUpdateStatus.ts` (líneas 82-95) invalida `['unified-contacts']` pero **NO invalida `['prospects']`**

Esto significa que cuando un lead pasa a "Reunión programada" o "PSH enviada", la tabla de prospectos **NO se entera del cambio**.

#### 2. **Sin Realtime Subscription**
El hook `useProspects.ts` no tiene ninguna suscripción a cambios en tiempo real de Supabase (postgres_changes). A diferencia de otros componentes como `RealtimeLeadsWidget` o `BookingsWidget`, los prospectos dependen únicamente del cache de React Query sin invalidación activa.

#### 3. **StaleTime de 2 Minutos**
El hook `useProspects.ts` tiene `staleTime: 1000 * 60 * 2` (2 minutos), lo que significa que aunque se navegue a la página, si no han pasado 2 minutos desde la última consulta, se mostrará data obsoleta.

### Verificación en Base de Datos
Los datos SÍ están correctos en la BD:
- `contact_statuses` tiene 2 estados marcados como `is_prospect_stage = true`:
  - "Reunión Programada" (`status_key: fase0_activo`)
  - "PSH Enviada" (`status_key: archivado`)
- Hay leads en estos estados con `empresa_id` vinculado (1 en valuations, 6 en contact_leads)

---

## Solución Propuesta

### Cambio 1: Invalidar Cache de Prospectos al Cambiar Estados

**Archivo**: `src/hooks/useContactUpdate.ts`

En la función `onSuccess` (línea 210), añadir invalidación de prospectos:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ['unified-contacts'],
    refetchType: 'none',
  });
  // ... otras invalidaciones existentes ...
  
  // NUEVO: Invalidar prospectos cuando cambia un estado
  queryClient.invalidateQueries({
    queryKey: ['prospects'],
  });
  
  toast({ ... });
},
```

**Archivo**: `src/hooks/useBulkUpdateStatus.ts`

En `onSuccess` (línea 80), añadir:

```typescript
onSuccess: (data, variables) => {
  queryClient.invalidateQueries({
    queryKey: ['unified-contacts'],
    refetchType: 'none',
  });
  
  // NUEVO: Invalidar prospectos
  queryClient.invalidateQueries({
    queryKey: ['prospects'],
  });
  
  // ... resto del código ...
},
```

### Cambio 2: Añadir Realtime Subscription a Prospectos

**Archivo**: `src/hooks/useProspects.ts`

Añadir suscripción en tiempo real para cambios de estado:

```typescript
import { useEffect } from 'react';

export const useProspects = (filters?: ProspectFilters) => {
  const queryClient = useQueryClient();
  const { statuses } = useContactStatuses();
  
  const prospectStatusKeys = statuses
    .filter(s => (s as any).is_prospect_stage && s.is_active)
    .map(s => s.status_key);

  // NUEVO: Suscripción realtime para cambios de estado
  useEffect(() => {
    if (prospectStatusKeys.length === 0) return;

    const channel = supabase
      .channel('prospects-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'company_valuations',
          filter: 'is_deleted=eq.false'
        },
        (payload) => {
          const newStatus = payload.new?.lead_status_crm;
          const oldStatus = payload.old?.lead_status_crm;
          
          // Si el estado cambió hacia/desde un estado de prospecto
          if (prospectStatusKeys.includes(newStatus) || 
              prospectStatusKeys.includes(oldStatus)) {
            queryClient.invalidateQueries({ queryKey: ['prospects'] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contact_leads',
          filter: 'is_deleted=eq.false'
        },
        (payload) => {
          const newStatus = payload.new?.lead_status_crm;
          const oldStatus = payload.old?.lead_status_crm;
          
          if (prospectStatusKeys.includes(newStatus) || 
              prospectStatusKeys.includes(oldStatus)) {
            queryClient.invalidateQueries({ queryKey: ['prospects'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [prospectStatusKeys, queryClient]);

  // ... resto del hook ...
};
```

### Cambio 3: Reducir StaleTime y Añadir Polling de Respaldo

**Archivo**: `src/hooks/useProspects.ts`

Modificar la configuración de la query:

```typescript
const query = useQuery({
  queryKey: ['prospects', prospectStatusKeys, filters],
  queryFn: async (): Promise<Prospect[]> => {
    // ... función existente ...
  },
  enabled: prospectStatusKeys.length > 0,
  staleTime: 1000 * 30, // REDUCIDO: 30 segundos (era 2 minutos)
  refetchInterval: 1000 * 60, // NUEVO: Polling cada 60 segundos como respaldo
  refetchOnWindowFocus: true, // NUEVO: Refetch al volver a la pestaña
});
```

### Cambio 4: Añadir Logging de Desarrollo

Para debugging futuro, añadir logs en desarrollo:

```typescript
queryFn: async (): Promise<Prospect[]> => {
  if (process.env.NODE_ENV === 'development') {
    console.info('[useProspects] Fetching prospects', {
      prospectStatusKeys,
      filters,
      timestamp: new Date().toISOString(),
    });
  }
  
  // ... resto de la función ...
  
  if (process.env.NODE_ENV === 'development') {
    console.info('[useProspects] Results', {
      totalProspects: prospects.length,
      fromValuations: (valuationLeads || []).length,
      fromContacts: (contactLeads || []).length,
    });
  }
  
  return prospects;
},
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useContactUpdate.ts` | Añadir invalidación de `['prospects']` en `onSuccess` |
| `src/hooks/useBulkUpdateStatus.ts` | Añadir invalidación de `['prospects']` en `onSuccess` |
| `src/hooks/useProspects.ts` | Añadir realtime subscription + reducir staleTime + añadir polling |

---

## Flujo Resultante

```text
┌─────────────────────────────────────────────────────────────┐
│  Usuario cambia estado a "Reunión Programada" en /contacts │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  useContactUpdate.onSuccess()                               │
│  → invalidateQueries(['prospects'])                         │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Cache       │  │ Realtime    │  │ Polling     │
│ Invalidated │  │ Subscription│  │ (60s backup)│
│ (inmediato) │  │ (UPDATE)    │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  /admin/prospectos muestra el lead actualizado              │
└─────────────────────────────────────────────────────────────┘
```

---

## Verificación Post-Implementación

1. **Cambiar estado inline en /admin/contacts** → Lead aparece en prospectos en <2s
2. **Cambiar estado desde panel lateral** → Lead aparece en prospectos en <2s
3. **Cambio masivo de estados** → Todos aparecen en prospectos en <2s
4. **Cambiar a estado NO prospecto** → Lead desaparece de prospectos
5. **Otro usuario cambia estados** → Realtime detecta y actualiza (<5s)
6. **Refrescar pestaña prospectos** → Datos actualizados
7. **Búsqueda en prospectos** → Resultados coherentes

---

## Notas Técnicas

- **No se modifica la base de datos**: Solo cambios en frontend
- **Sin duplicación de datos**: Los prospectos siguen siendo un derivado de leads
- **Compatibilidad RLS**: Las políticas existentes no se modifican
- **Sin romper otros módulos**: Las invalidaciones son aditivas, no reemplazan las existentes
- **Polling como respaldo**: Si realtime falla, el polling garantiza actualización máxima cada 60s
