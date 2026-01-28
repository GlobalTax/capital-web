

# Plan: Guardar Todo el Contenido Estructurado de la Tesis

## Problema Identificado

Cuando generas una Tesis de Inversión con IA, se muestra contenido estructurado completo:
- Resumen
- Objetivo Estratégico
- Perfil de Empresa Ideal
- Criterios de Exclusión
- Sinergias Buscadas
- Proceso de Evaluación

Pero al pulsar "Guardar", **solo se guarda el texto plano** (`investment_thesis_text`), perdiendo toda la estructura.

---

## Solución Propuesta

Guardar todo el contenido estructurado en el campo JSONB existente (`enriched_data`) o crear un nuevo campo específico para la tesis estructurada.

### Opción A: Usar `enriched_data` existente (Recomendada)

El campo `enriched_data` (JSONB) ya existe y se usa para datos enriquecidos. Podemos añadir la tesis estructurada ahí:

```json
{
  "investment_thesis_structured": {
    "summary": "Resumen de la tesis...",
    "strategic_objective": "Objetivo estratégico...",
    "ideal_target_profile": "Perfil ideal...",
    "exclusion_criteria": ["Criterio 1", "Criterio 2"],
    "synergies_sought": ["Sinergia 1", "Sinergia 2"],
    "evaluation_process": "Proceso de evaluación...",
    "generated_at": "2026-01-28T..."
  }
}
```

### Opción B: Nuevo campo JSONB dedicado

Crear un campo `investment_thesis_data` (JSONB) específico para la tesis.

---

## Implementación (Opción A - Recomendada)

### 1. Modificar `CorporateAIPanel.tsx`

Actualizar la función `handleSaveThesis` para guardar tanto el texto plano como la estructura completa:

```typescript
const handleSaveThesis = async () => {
  if (!thesisResult) return;
  setIsSavingThesis(true);
  try {
    // Preparar datos estructurados
    const thesisStructured = {
      summary: thesisResult.summary,
      strategic_objective: thesisResult.thesis.strategic_objective,
      ideal_target_profile: thesisResult.thesis.ideal_target_profile,
      exclusion_criteria: thesisResult.thesis.exclusion_criteria,
      synergies_sought: thesisResult.thesis.synergies_sought,
      evaluation_process: thesisResult.thesis.evaluation_process,
      generated_at: new Date().toISOString()
    };

    // Combinar con enriched_data existente
    const currentEnrichedData = buyer.enriched_data || {};
    const updatedEnrichedData = {
      ...currentEnrichedData,
      investment_thesis_structured: thesisStructured
    };

    await updateBuyer.mutateAsync({
      id: buyer.id,
      data: { 
        investment_thesis: thesisResult.investment_thesis_text || thesisResult.summary,
        enriched_data: updatedEnrichedData
      }
    });
    toast.success('Tesis de inversión guardada completamente');
  } catch (error) {
    toast.error('Error al guardar la tesis');
  } finally {
    setIsSavingThesis(false);
  }
};
```

### 2. Mostrar datos guardados al cargar

Cuando el buyer ya tiene tesis guardada, pre-cargar `thesisResult` desde `enriched_data`:

```typescript
// En el componente, inicializar desde datos guardados
useEffect(() => {
  if (buyer.enriched_data?.investment_thesis_structured && !thesisResult) {
    const saved = buyer.enriched_data.investment_thesis_structured;
    setThesisResult({
      thesis: {
        strategic_objective: saved.strategic_objective,
        ideal_target_profile: saved.ideal_target_profile,
        exclusion_criteria: saved.exclusion_criteria || [],
        synergies_sought: saved.synergies_sought || [],
        evaluation_process: saved.evaluation_process || ''
      },
      summary: saved.summary,
      investment_thesis_text: buyer.investment_thesis || ''
    });
  }
}, [buyer]);
```

---

## Cambios Visuales

### Indicador de Tesis Guardada

Cuando hay tesis estructurada guardada, mostrar badge:

```text
┌─────────────────────────────────────────┐
│  Tesis  ✓ Guardada                      │
│ ─────────────────────────────────────── │
│  [Objetivo Estratégico]                 │
│  Expandir presencia en sector...        │
│                                         │
│  [Perfil de Empresa Ideal]              │
│  Empresa familiar con EBITDA...         │
│                                         │
│  [Criterios de Exclusión]               │
│  × Real estate                          │
│  × Startups pre-revenue                 │
│                                         │
│  [Sinergias Buscadas]                   │
│  ✓ Economías de escala                  │
│  ✓ Expansión geográfica                 │
│                                         │
│  [Regenerar] [Guardar ✓]                │
└─────────────────────────────────────────┘
```

---

## Sección Técnica

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/corporate-buyers/CorporateAIPanel.tsx` | Actualizar `handleSaveThesis` y añadir carga inicial de tesis guardada |

### Datos Guardados

| Campo | Antes | Después |
|-------|-------|---------|
| `investment_thesis` | Solo texto plano | Texto plano (sin cambio) |
| `enriched_data.investment_thesis_structured` | No existía | Objeto completo con toda la estructura |

### Impacto

- **Archivos modificados:** 1
- **Líneas estimadas:** ~40
- **Riesgo:** Muy bajo (aditivo, no rompe nada existente)
- **Compatibilidad:** Total con datos anteriores

