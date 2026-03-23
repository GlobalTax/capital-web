

## Actualización instantánea del pipeline sin refrescar página

### Problema
Las mutaciones (cambiar estado, asignar dueño) invalidan la query pero el usuario no ve el cambio hasta que se refresca. Esto ocurre porque la invalidación marca la query como stale, pero la UI no refleja el cambio inmediatamente de forma visible.

### Solución: Optimistic updates en todas las mutaciones

Modificar **`src/features/leads-pipeline/hooks/useLeadsPipeline.ts`** para que cada mutación actualice el cache local de React Query **antes** de que responda el servidor:

**1. `updateStatusMutation`** - Actualizar `lead_status_crm` optimísticamente
- En `onMutate`: cancelar queries en vuelo, actualizar el lead en cache con el nuevo status
- En `onError`: restaurar snapshot anterior
- En `onSettled`: invalidar para sincronizar con servidor

**2. `assignLeadMutation`** - Actualizar `assigned_to` optimísticamente
- En `onMutate`: cancelar queries, actualizar `assigned_to` del lead en cache
- En `onError`: rollback
- En `onSettled`: invalidar

**3. Patrón común para ambas mutaciones:**

```typescript
onMutate: async (variables) => {
  await queryClient.cancelQueries({ queryKey: ['leads-pipeline'] });
  const previous = queryClient.getQueryData(['leads-pipeline']);
  
  queryClient.setQueryData(['leads-pipeline'], (old: PipelineLead[]) =>
    old.map(lead => lead.id === variables.leadId 
      ? { ...lead, /* campo actualizado */ } 
      : lead
    )
  );
  
  return { previous };
},
onError: (err, vars, context) => {
  queryClient.setQueryData(['leads-pipeline'], context?.previous);
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
},
```

### Resultado
- Cambiar estado de un lead → la tarjeta se mueve a la columna correcta al instante
- Asignar dueño → el nombre aparece inmediatamente en la tarjeta
- Si el servidor falla → rollback automático al estado anterior
- Se mantiene la invalidación para sincronizar datos reales en background

