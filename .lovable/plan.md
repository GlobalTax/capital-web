
## Plan: Fix para datos de facturación vacíos en /admin/contacts

### Diagnóstico Confirmado

Tras una investigación exhaustiva del flujo de datos, he confirmado lo siguiente:

**Estado de los datos en la base de datos:**
- **956 valoraciones activas** (sin soft delete)
- **940 (98.3%)** tienen campo `revenue` con valor
- **931 (97.4%)** tienen campo `ebitda` con valor
- Todos los registros recientes tienen datos financieros completos

**El código de mapeo es correcto:**
```typescript
// useUnifiedContacts.tsx líneas 335-336
ebitda: lead.ebitda,
revenue: lead.revenue,
```

**El código de renderizado es correcto:**
```typescript
// ContactTableRow.tsx línea 110
const revenue = formatCurrency(contact.empresa_facturacion || contact.revenue);
```

### Causa Raíz Identificada

El problema está en la **serialización de tipos NUMERIC por PostgreSQL/PostgREST**. Los campos `revenue`, `ebitda` y `final_valuation` son de tipo `NUMERIC(15,2)`, que pueden ser serializados como **strings** en lugar de números JavaScript cuando vienen de la API.

El helper `formatCurrency` actual no maneja esta conversión:

```typescript
const formatCurrency = (value?: number) => {
  if (!value) return null;  // Si value es "1500000.00" (string), no entra aquí
  // Pero las operaciones matemáticas fallarán o darán resultados incorrectos
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
  ...
};
```

---

### Cambios a Implementar

#### 1. Actualizar `ContactTableRow.tsx` - Robustecer `formatCurrency`

**Líneas 54-59:**

Convertir explícitamente a número para manejar tanto strings como números:

```typescript
const formatCurrency = (value?: number | string | null) => {
  // Handle null, undefined, empty string
  if (value === null || value === undefined || value === '') return null;
  
  // Convert to number (handles both number and string "1500000.00")
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check for valid number
  if (isNaN(numValue) || numValue === 0) return null;
  
  if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M€`;
  if (numValue >= 1000) return `${Math.round(numValue / 1000)}K€`;
  return `${Math.round(numValue)}€`;
};
```

#### 2. Actualizar `useUnifiedContacts.tsx` - Normalizar datos al mapear

**Líneas 334-337:**

Asegurar conversión numérica durante el mapeo:

```typescript
// Normalizar a número durante el mapeo
final_valuation: lead.final_valuation != null ? Number(lead.final_valuation) : undefined,
ebitda: lead.ebitda != null ? Number(lead.ebitda) : undefined,
revenue: lead.revenue != null ? Number(lead.revenue) : undefined,
```

Aplicar el mismo patrón para `contact_leads` con `empresa_facturacion`:

```typescript
// Línea 303 aproximadamente
empresa_facturacion: (lead.empresas as any)?.facturacion != null 
  ? Number((lead.empresas as any).facturacion) 
  : undefined,
```

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/contacts/ContactTableRow.tsx` | Actualizar `formatCurrency` para manejar strings |
| `src/hooks/useUnifiedContacts.tsx` | Normalizar campos numéricos con `Number()` en el mapeo |

---

### Pruebas Obligatorias Post-Fix

1. **Verificar tabla de Leads:**
   - Ir a `/admin/contacts` → pestaña "Todos"
   - Confirmar que los leads de tipo "Valoración" (badge verde) muestran facturación y EBITDA

2. **Verificar formato correcto:**
   - Valores ≥ 1M → `1.5M€`
   - Valores ≥ 1K → `500K€`
   - Valores < 1K → `500€`

3. **Verificar valores especiales:**
   - Valor 0 → `—`
   - Valor null/undefined → `—`

---

### Detalles Técnicos

**Por qué sucede esto:**

PostgreSQL `NUMERIC(15,2)` es un tipo de precisión arbitraria. PostgREST (el API de Supabase) puede serializar estos valores como strings `"1500000.00"` para evitar pérdida de precisión cuando se convierten a IEEE 754 floats de JavaScript.

**Por qué el fix funciona:**

- `Number("1500000.00")` → `1500000` (conversión explícita)
- `parseFloat("1500000.00")` → `1500000` (alternativa)
- El mapeo normalizado garantiza que los datos siempre sean números antes de llegar al componente de UI
