

## Plan: Corregir asignación de leads en Pipeline de Compras

### Problema
El error "Could not find the 'assigned_at' column of 'acquisition_leads'" ocurre porque en `useBuyPipeline.ts` línea 336, la mutación de asignación intenta actualizar `assigned_at` en todas las tablas, pero `acquisition_leads` y `company_acquisition_inquiries` no tienen esa columna.

### Solución

**Archivo:** `src/features/leads-pipeline/hooks/useBuyPipeline.ts`

Modificar la mutación `assignLeadMutation` (línea 331-338) para construir el payload condicionalmente según la tabla:

- Para `company_valuations` y `contact_leads`: enviar `{ assigned_to, assigned_at }`
- Para `acquisition_leads` y `company_acquisition_inquiries`: enviar solo `{ assigned_to }`

```typescript
mutationFn: async ({ leadId, userId }) => {
  const origin = getLeadOrigin(leadId);
  const table = getTableName(origin);
  
  // Only include assigned_at for tables that support it
  const payload: Record<string, any> = { assigned_to: userId };
  if (origin === 'valuation_compras' || origin === 'contact_compras') {
    payload.assigned_at = userId ? new Date().toISOString() : null;
  }
  
  const { error } = await supabase
    .from(table as any)
    .update(payload)
    .eq('id', leadId);
  if (error) throw error;
},
```

### Resultado
La asignación funcionará para leads de cualquier origen sin intentar escribir columnas inexistentes.

