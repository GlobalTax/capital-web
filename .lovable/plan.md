

## Problema encontrado

**Causa raíz**: La query de `sell_leads` en `useContacts.ts` intenta hacer joins con columnas que **no existen** en esa tabla:

```typescript
// FALLA: sell_leads NO tiene acquisition_channel_id ni lead_form
supabase.from('sell_leads')
  .select('*, acquisition_channel:acquisition_channel_id(name), lead_form_ref:lead_form(name)')
```

La tabla `sell_leads` solo tiene 23 columnas básicas (full_name, email, company, revenue_range, etc.) — no tiene `acquisition_channel_id` ni `lead_form`. Esto causa que la query falle, y al estar dentro de `Promise.all`, puede hacer que toda la carga de datos falle o devuelva null para sell_leads.

**Problema adicional**: `company_valuations` tiene 1421 registros pero Supabase limita a 1000 por defecto — se pierden ~400 valoraciones.

## Plan de corrección

### Paso 1 — Corregir la query de sell_leads
Eliminar los joins inexistentes de la query de `sell_leads`:

```typescript
// Antes (FALLA)
supabase.from('sell_leads')
  .select('*, acquisition_channel:acquisition_channel_id(name), lead_form_ref:lead_form(name)')

// Después (CORRECTO)
supabase.from('sell_leads')
  .select('*')
```

### Paso 2 — Paginar company_valuations para superar el límite de 1000
Añadir `.range(0, 4999)` o similar a la query de `company_valuations` para asegurar que se traen todos los registros. Aplicar el mismo rango de seguridad a `contact_leads` por si crece.

### Paso 3 — Proteger Promise.all con manejo individual de errores
Envolver cada query en su propio try/catch o usar `Promise.allSettled` para que si una tabla falla, las demás sigan funcionando y no se pierda todo.

### Archivos afectados
- `src/components/admin/contacts-v2/hooks/useContacts.ts` (único archivo)

### Resultado
- Los 76 sell_leads (incluido yafrat urban slu) aparecerán correctamente
- Todas las ~1421 valoraciones se cargarán (no solo 1000)
- Si una tabla falla, las demás seguirán mostrándose

