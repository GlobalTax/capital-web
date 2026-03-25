

## Fix: "Coral Food España SL" duplicado en el Pipeline

### Problema
Hay **dos registros duplicados** de "Coral Food España SL" en la tabla `company_valuations`:
- `8f9f216a` → estado `contactando` (ya movido)
- `babb009a` → estado `nuevo` (el que parece "bugeado")

Ambos tienen el mismo email (`yani`) y fueron creados con 44 segundos de diferencia. El pipeline los muestra como dos tarjetas separadas porque la deduplicación actual solo filtra `contact_leads` contra `company_valuations`, pero **no deduplica valuaciones entre sí**.

### Solución en 2 partes

**1. Corrección inmediata de datos**: Marcar el registro duplicado como eliminado vía migración SQL:
```sql
UPDATE company_valuations 
SET is_deleted = true 
WHERE id = 'babb009a-9299-4398-bd24-9746813bcda0';
```

**2. Prevención futura** (en `useLeadsPipeline.ts`): Añadir deduplicación dentro de las valuaciones por email, conservando el registro más reciente con estado más avanzado (no "nuevo"):

```typescript
// Después de crear valLeads, deduplicar por email
const deduplicatedValLeads = Array.from(
  valLeads.reduce((map, lead) => {
    const key = lead.email?.toLowerCase();
    if (!key) { map.set(lead.id, lead); return map; }
    const existing = map.get(key);
    if (!existing || (existing.lead_status_crm === 'nuevo' && lead.lead_status_crm !== 'nuevo')) {
      map.set(key, lead);
    }
    return map;
  }, new Map<string, PipelineLead>()).values()
);
```

### Archivos afectados
- Nueva migración SQL (1 UPDATE)
- `src/features/leads-pipeline/hooks/useLeadsPipeline.ts` (deduplicación de valuaciones)

