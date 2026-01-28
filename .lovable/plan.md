

# Plan: Completar Internacionalización de Cards en /oportunidades

## Problema Actual

Veo en la captura que hay 3 tipos de contenido que siguen en español:

| Elemento | Estado | Causa |
|----------|--------|-------|
| **Sector** | Traducido | `resolved_sector` funciona correctamente |
| **Descripciones** | En español | `description_en` es NULL en base de datos |
| **Highlights** | En español | No existe campo `highlights_en` en BD |

### Ejemplos de la captura:
- Descripciones: "Oportunidad de adquirir una empresa líder en el diseño..."
- Highlights: "Empresa consolidada en su sector", "Equipo de gestión experimentado"

---

## Solución Propuesta

### Fase 1: Añadir campos de traducción para highlights

Crear columnas `highlights_en` y `highlights_ca` en `company_operations`:

```sql
ALTER TABLE company_operations 
ADD COLUMN highlights_en TEXT[] DEFAULT NULL,
ADD COLUMN highlights_ca TEXT[] DEFAULT NULL;
```

### Fase 2: Actualizar Edge Function para resolver highlights

Añadir lógica de resolución para highlights igual que para descripciones:

```typescript
resolved_highlights: locale === 'en' && op.highlights_en 
  ? op.highlights_en 
  : locale === 'ca' && op.highlights_ca
    ? op.highlights_ca
    : op.highlights
```

### Fase 3: Actualizar interfaces TypeScript

Añadir `resolved_highlights` a las interfaces en:
- `OperationsList.tsx`
- `OperationCard.tsx`
- `OperationDetailsModal.tsx`

### Fase 4: Usar campo traducido en OperationCard

```typescript
// En el renderizado de highlights
{(operation.resolved_highlights || operation.highlights)?.slice(0, 2).map((highlight, index) => (
  <span key={index} className="...">
    {highlight}
  </span>
))}
```

### Fase 5: (Recomendado) Poblar traducciones

Para que las descripciones y highlights aparezcan en inglés, hay dos opciones:

**Opción A: Manual**
Añadir traducciones desde el panel admin o directamente en BD

**Opción B: Automatizada con IA**
Crear una Edge Function que use OpenAI/Claude para traducir automáticamente

---

## Archivos a Crear/Modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migración SQL | Añadir columnas `highlights_en`, `highlights_ca` |
| `list-operations/index.ts` | Añadir `resolved_highlights` al mapeo |
| `OperationsList.tsx` | Añadir `resolved_highlights` a interface |
| `OperationCard.tsx` | Usar `resolved_highlights` |
| `OperationDetailsModal.tsx` | Usar `resolved_highlights` |

---

## Sección Técnica

### Migración SQL

```sql
-- Añadir campos de traducción para highlights
ALTER TABLE public.company_operations 
ADD COLUMN IF NOT EXISTS highlights_en TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS highlights_ca TEXT[] DEFAULT NULL;

-- Comentarios descriptivos
COMMENT ON COLUMN public.company_operations.highlights_en IS 'Highlights traducidos al inglés';
COMMENT ON COLUMN public.company_operations.highlights_ca IS 'Highlights traducidos al catalán';
```

### Cambio en Edge Function

```typescript
// En el mapeo de resolvedData (líneas 252-275)
const resolvedData = (data || []).map(op => {
  // ... código existente ...
  
  return {
    ...op,
    resolved_sector: resolvedSector,
    resolved_description: /* ... existente ... */,
    resolved_short_description: /* ... existente ... */,
    // NUEVO: Resolver highlights por locale
    resolved_highlights: locale === 'en' && op.highlights_en && op.highlights_en.length > 0
      ? op.highlights_en 
      : locale === 'ca' && op.highlights_ca && op.highlights_ca.length > 0
        ? op.highlights_ca
        : op.highlights
  };
});
```

### Cambios en Interfaces

```typescript
// Añadir a Operation interface en todos los archivos
interface Operation {
  // ... campos existentes ...
  highlights?: string[];
  // NUEVO
  resolved_highlights?: string[];
}
```

### Cambio en OperationCard.tsx

```typescript
// Líneas 266-278 - Usar resolved_highlights
{(operation.resolved_highlights || operation.highlights) && 
 (operation.resolved_highlights || operation.highlights)!.length > 0 && (
  <div className="flex flex-wrap gap-1">
    {(operation.resolved_highlights || operation.highlights)!.slice(0, 2).map((highlight, index) => (
      <span 
        key={index}
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
      >
        {highlight}
      </span>
    ))}
  </div>
)}
```

---

## Nota Importante: Poblar Traducciones

**El sistema quedará preparado para mostrar traducciones**, pero las descripciones y highlights seguirán en español hasta que se llenen los campos `description_en`, `short_description_en`, `highlights_en` en la base de datos.

**Opciones para poblar traducciones:**

1. **Manual**: Editar cada operación desde el admin panel
2. **Script SQL**: UPDATE masivo con traducciones predefinidas
3. **Edge Function con IA**: Crear endpoint que traduzca automáticamente usando OpenAI

**Recomendación**: Tras implementar este plan, crear un botón "Traducir automáticamente" en el admin panel que invoque una Edge Function de traducción con IA.

---

## Impacto

| Métrica | Valor |
|---------|-------|
| Migración SQL | 1 |
| Archivos modificados | 4 |
| Líneas añadidas | ~30 |
| Riesgo | Bajo (cambios aditivos con fallback) |
| Tiempo estimado | 20 minutos |

