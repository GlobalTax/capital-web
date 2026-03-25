

## Fix: Pipeline Compras no carga datos

### Problema raiz
La query de `company_valuations` en `useBuyPipeline.ts` selecciona `sectors_of_interest`, pero esa columna **no existe** en la tabla `company_valuations`. Esto causa un error en la query de Supabase que impide cargar los 50 leads de compras de esa tabla. Lo mismo podría afectar la carga completa del pipeline.

### Solución

**`src/features/leads-pipeline/hooks/useBuyPipeline.ts`**

1. Eliminar `sectors_of_interest` del SELECT de `company_valuations` (línea 67). Esa columna no existe en esa tabla.
2. Usar `ai_sector_name` como alternativa para mostrar el sector en la tarjeta (campo que sí existe).

Cambio concreto:
```typescript
// ANTES (línea 63-72)
.select(`
  id, contact_name, company_name, email, phone,
  lead_status_crm, sectors_of_interest, notes, created_at,
  acquisition_channel_id, lead_form
`)

// DESPUÉS
.select(`
  id, contact_name, company_name, email, phone,
  lead_status_crm, ai_sector_name, notes, created_at,
  acquisition_channel_id, lead_form
`)
```

Y en el mapeo (línea 133):
```typescript
// ANTES
sectors_of_interest: v.sectors_of_interest || null,

// DESPUÉS
sectors_of_interest: v.ai_sector_name || null,
```

### Archivos afectados (1)
- `src/features/leads-pipeline/hooks/useBuyPipeline.ts`

