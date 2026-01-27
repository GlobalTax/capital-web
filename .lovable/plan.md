
# Plan: Arreglar Facturación y Provincia en Tabla de Leads

## Diagnóstico

### Problema 1: Facturación no aparece para leads de valoración
La query de `company_valuations` en `useUnifiedContacts.tsx` **no incluye** el JOIN con la tabla `empresas`, por lo que no se obtiene la facturación de la empresa vinculada.

**Situación actual:**
```typescript
// Línea 199-200 - SIN JOIN con empresas
.select('*, lead_status_crm, assigned_to, lead_form, acquisition_channel:..., lead_form_ref:..., apollo_status, ...')
```

**Contraste con contact_leads (que SÍ funciona):**
```typescript
// Línea 191 - CON JOIN con empresas
.select('*, ..., empresas:empresa_id(id, nombre, facturacion), ...')
```

### Problema 2: Provincia (location)
El campo `location` ya existe en la tabla, en el hook, y en la UI. El problema es que **los datos no están poblados** en la mayoría de registros (la query devuelve `location: <nil>` para 10 de 10 registros).

Esto es un problema de **datos**, no de código. La columna ya se muestra correctamente si tiene valor.

---

## Solución Propuesta

### Cambio Único: Modificar `useUnifiedContacts.tsx`

#### 1. Agregar JOIN con empresas en la query de company_valuations

**Antes (línea 199-200):**
```typescript
const { data: valuationLeads, error: valuationError } = await supabase
  .from('company_valuations')
  .select('*, lead_status_crm, assigned_to, lead_form, acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name), apollo_status, apollo_error, apollo_org_id, apollo_last_enriched_at, apollo_org_data, apollo_candidates')
```

**Después:**
```typescript
const { data: valuationLeads, error: valuationError } = await supabase
  .from('company_valuations')
  .select('*, lead_status_crm, assigned_to, lead_form, empresas:empresa_id(id, nombre, facturacion), acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name), apollo_status, apollo_error, apollo_org_id, apollo_last_enriched_at, apollo_org_data, apollo_candidates')
```

#### 2. Agregar mapeo de empresa en la transformación de valuation leads

**Después (agregar después de línea 366):**
```typescript
// 🔥 Empresa vinculada
empresa_id: lead.empresa_id,
empresa_nombre: (lead.empresas as any)?.nombre || null,
empresa_facturacion: (lead.empresas as any)?.facturacion != null ? Number((lead.empresas as any).facturacion) : undefined,
```

---

## Resultado Esperado

| Campo | Antes | Después |
|-------|-------|---------|
| Facturación (leads valoración) | — | ✅ Muestra `revenue` o `empresa_facturacion` |
| Provincia | ✅ Ya funciona | ✅ Ya funciona (si tiene datos) |

---

## Flujo de Datos Corregido

```
company_valuations
    ├── revenue (datos propios del lead)
    ├── ebitda (datos propios del lead)
    ├── location (provincia del lead)
    └── empresa_id → empresas
                        ├── nombre → empresa_nombre
                        └── facturacion → empresa_facturacion
```

La columna "Fact." en la tabla usa la lógica:
```typescript
const revenue = formatCurrency(contact.empresa_facturacion || contact.revenue);
```

Esto significa que si existe `empresa_facturacion` (de la empresa vinculada), la usa; si no, usa `revenue` (del lead original).

---

## Sección Técnica

### Archivo a modificar
`src/hooks/useUnifiedContacts.tsx`

### Cambios específicos
1. **Línea ~200**: Agregar `empresas:empresa_id(id, nombre, facturacion)` al SELECT de company_valuations
2. **Línea ~366**: Agregar mapeo de `empresa_id`, `empresa_nombre`, `empresa_facturacion` en la transformación

### Impacto
- Archivos modificados: 1
- Líneas cambiadas: ~5
- Riesgo: Bajo (agrega datos sin cambiar lógica existente)
- Performance: Mínimo (1 JOIN adicional, ya optimizado por índice FK)

### Nota sobre Provincia
La columna de provincia ya está funcionando. Si los datos no aparecen, es porque el campo `location` no está poblado en la base de datos. Esto puede requerir una migración de datos o ajuste en el formulario de valoración para capturar la provincia.
