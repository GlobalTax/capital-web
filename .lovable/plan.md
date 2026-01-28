
# Plan: Corregir Internacionalización de las Cards en /oportunidades

## Problema Identificado

Las cards de operaciones en `/oportunidades` muestran contenido en español aunque el usuario tenga el idioma configurado en inglés. Hay dos causas:

### Causa 1: OperationCard no usa los campos traducidos

El componente `OperationCard.tsx` usa los campos originales en lugar de los campos resueltos por idioma:

```typescript
// ACTUAL (incorrecto)
operation.short_description || operation.description

// DEBERÍA SER
operation.resolved_short_description || operation.resolved_description
```

### Causa 2: Datos de BD sin traducciones

Los campos `description_en`, `description_ca`, `short_description_en`, `short_description_ca` están vacíos (`null`) para todas las operaciones:

| Proyecto | description_en | short_description_en |
|----------|---------------|---------------------|
| Proyecto Box | null | null |
| Proyecto King | null | null |
| Proyecto Demox | null | null |

### Causa 3: Sector no traducido en la card

El campo `sector` en cada operación está guardado como texto en español (ej: "Construcción"), aunque la tabla `sectors` tiene traducciones (ej: "Construction" en `name_en`).

---

## Solución Propuesta

### Paso 1: Actualizar OperationCard para usar campos traducidos

Modificar `OperationCard.tsx` para priorizar los campos `resolved_*`:

```typescript
// Description - usar campo traducido con fallback
const displayDescription = operation.resolved_short_description 
  || operation.resolved_description 
  || operation.short_description 
  || operation.description;
```

### Paso 2: Resolver sector traducido en Edge Function

Actualizar `list-operations/index.ts` para incluir el sector traducido:

```typescript
// En el mapeo de resultados, añadir:
const resolvedData = (data || []).map(op => {
  // Buscar traducción del sector
  const sectorMatch = sectorsData?.find(s => s.name_es === op.sector);
  
  return {
    ...op,
    resolved_sector: locale === 'en' && sectorMatch?.name_en 
      ? sectorMatch.name_en 
      : op.sector,
    resolved_description: ...,
    resolved_short_description: ...
  };
});
```

### Paso 3: Usar sector traducido en OperationCard

```typescript
// En el Badge de sector:
<Badge variant="outline" className="text-xs w-fit">
  {operation.resolved_sector || operation.sector}
</Badge>
```

### Paso 4: (Recomendado) Poblar traducciones de descripciones

Para que las descripciones aparezcan en inglés, es necesario completar los campos de traducción en la tabla `company_operations`. Esto se puede hacer:

A) **Manualmente** desde el panel admin
B) **Con IA** usando una Edge Function que traduzca automáticamente
C) **Script de migración** para traducir en lote

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/operations/OperationCard.tsx` | Usar `resolved_short_description`, `resolved_description`, `resolved_sector` |
| `supabase/functions/list-operations/index.ts` | Añadir `resolved_sector` al mapeo de resultados |
| `src/components/operations/OperationDetailsModal.tsx` | Verificar y actualizar para usar campos traducidos |

---

## Sección Técnica

### Campos Afectados en OperationCard

| Campo Actual | Campo Traducido | Fallback |
|--------------|-----------------|----------|
| `description` | `resolved_description` | `description` |
| `short_description` | `resolved_short_description` | `short_description` |
| `sector` | `resolved_sector` (nuevo) | `sector` |
| `highlights` | (sin traducción) | Mantener español |

### Tipado TypeScript

Actualizar interface `Operation` en `OperationCard.tsx`:

```typescript
interface Operation {
  // ... campos existentes ...
  resolved_description?: string;
  resolved_short_description?: string;
  resolved_sector?: string;
}
```

### Impacto

- **Archivos modificados**: 2-3
- **Líneas modificadas**: ~20
- **Riesgo**: Bajo (cambios aditivos con fallback)
- **Compatibilidad**: Total (fallback a español si no hay traducción)

---

## Limitación Importante

**Las descripciones seguirán en español** hasta que se poblen los campos `description_en` y `short_description_en` en la base de datos. Esta implementación solo arregla que el frontend USE los campos traducidos cuando existan.

Para una solución completa, se necesita también poblar las traducciones en la BD (tarea separada).
