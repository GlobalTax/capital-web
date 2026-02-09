

## Fix: Leads con Valoracion PRO no muestran datos de compania en el listado

### Diagnostico

El hook `useUnifiedContacts.tsx` YA hace un fetch de `professional_valuations` (linea 267) y crea un mapa por `linked_lead_id` (linea 276). Sin embargo, el query solo trae campos parciales y el mapeo de contact_leads no aplica fallback para todos los campos necesarios:

| Campo en tabla | Se trae en query? | Se mapea? | Se muestra en tabla? |
|---|---|---|---|
| `client_company` (nombre empresa) | NO | NO | Columna vacia |
| `financial_years->0->>'revenue'` (facturacion) | NO | NO | Columna vacia |
| `normalized_ebitda` | SI | SI | OK |
| `valuation_central` | SI | SI (como `final_valuation`) | OK |
| `sector` | SI | SI (como `industry`) | OK |

Ademas, el mapeo actual (lineas 331-334) asigna los datos PRO directamente sin hacer fallback con los datos propios del contact_lead, lo cual podria sobreescribir datos existentes.

### Solucion

Modificar unicamente `src/hooks/useUnifiedContacts.tsx`:

**1. Ampliar el SELECT de professional_valuations (linea 269)**

Anadir `client_company` y `financial_years` al select:

```
.select('linked_lead_id, valuation_central, valuation_low, valuation_high, normalized_ebitda, sector, client_company, financial_years')
```

**2. Actualizar el tipo del mapa (linea 281)**

Anadir `client_company` y `financial_years` al tipo del record.

**3. Corregir el mapeo de contact_leads (lineas 296-347)**

Aplicar fallback (COALESCE en JS) para que los datos propios del lead tengan prioridad y PRO sea el fallback:

```typescript
// Nombre empresa: prioridad lead.company, fallback PRO
company: lead.company || proValuation?.client_company || undefined,

// Revenue: extraer del JSONB financial_years del PRO (no existe en contact_leads)
revenue: proValuation?.financial_years?.[0]?.revenue 
  ? Number(proValuation.financial_years[0].revenue) 
  : undefined,

// EBITDA: fallback a PRO
ebitda: proValuation?.normalized_ebitda != null 
  ? Number(proValuation.normalized_ebitda) 
  : undefined,

// Valoracion: fallback a PRO
final_valuation: proValuation?.valuation_central != null 
  ? Number(proValuation.valuation_central) 
  : undefined,

// Sector: prioridad lead, fallback PRO
industry: proValuation?.sector || undefined,
```

### Lo que NO se toca

- Filtros, estados, canal, formulario, paginacion: sin cambios
- Queries de company_valuations, collaborator_applications, etc.: sin cambios
- Componentes UI de la tabla: sin cambios
- Base de datos: sin migraciones

### Validacion

- Caso A (lead con valoracion normal): no cambia nada (son `company_valuations`, query separado)
- Caso B (lead solo con PRO vinculado): ahora mostrara empresa, facturacion, EBITDA, valoracion y sector
- Caso C (lead con datos propios + PRO): datos del lead tienen prioridad, PRO como fallback

### Archivo afectado

- `src/hooks/useUnifiedContacts.tsx` - Ampliar query y mapeo de professional_valuations
