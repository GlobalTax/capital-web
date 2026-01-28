

# Plan: Corregir Interface Operation en OperationsList.tsx

## Problema Identificado

La internacionalizacion de las cards en `/oportunidades` **no funciona** porque la interface `Operation` en `OperationsList.tsx` NO incluye los campos traducidos que devuelve la Edge Function.

### Flujo actual (roto):

```text
1. Edge Function devuelve: { resolved_sector: "Construction", resolved_description: "...", ... }
2. OperationsList.tsx tipea los datos como `Operation` (sin campos resolved_*)
3. TypeScript/React ignora campos no definidos en la interface
4. OperationCard recibe operation SIN los campos resolved_*
5. Cards muestran contenido en espanol (fallback)
```

### Evidencia:

**Interface actual en OperationsList.tsx (lineas 18-38):**
```typescript
interface Operation {
  id: string;
  company_name: string;
  sector: string;
  // ... otros campos ...
  // ❌ FALTAN: resolved_sector, resolved_description, resolved_short_description
}
```

**Interface en OperationCard.tsx (correcta, lineas 28-58):**
```typescript
interface Operation {
  // ... campos existentes ...
  // ✅ TIENE:
  resolved_description?: string;
  resolved_short_description?: string;
  resolved_sector?: string;
}
```

---

## Solucion

Actualizar la interface `Operation` en `OperationsList.tsx` para incluir los campos traducidos:

### Cambio Requerido

```typescript
// OperationsList.tsx - linea 38 (antes de cerrar la interface)
// Anadir estos campos:
  project_status?: string;
  expected_market_text?: string;
  // Campos i18n resueltos
  resolved_description?: string;
  resolved_short_description?: string;
  resolved_sector?: string;
}
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/operations/OperationsList.tsx` | Anadir 3 campos `resolved_*` a la interface Operation |

---

## Seccion Tecnica

### Cambio Especifico

En `OperationsList.tsx`, modificar la interface `Operation` (lineas 18-38):

**Antes:**
```typescript
interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  display_locations: string[];
  created_at?: string;
}
```

**Despues:**
```typescript
interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  display_locations: string[];
  created_at?: string;
  project_status?: string;
  expected_market_text?: string;
  // i18n resolved fields
  resolved_description?: string;
  resolved_short_description?: string;
  resolved_sector?: string;
}
```

### Impacto

| Metrica | Valor |
|---------|-------|
| Archivos modificados | 1 |
| Lineas anadidas | 5 |
| Riesgo | Muy bajo (solo tipado) |
| Tiempo estimado | 2 minutos |

### Resultado Esperado

Una vez aplicado este cambio:
1. Los campos `resolved_*` se preservaran al setear el estado
2. `OperationCard` recibira los campos traducidos
3. Las cards mostraran el sector en ingles ("Construction" en vez de "Construccion")
4. Las descripciones mostraran traducciones cuando existan en la BD

---

## Nota sobre Descripciones

Las descripciones seguiran en espanol hasta que se pueblen los campos `description_en` en la base de datos. El sector SI se traducira inmediatamente porque la Edge Function ya resuelve la traduccion desde la tabla `sectors`.

