
## Diagnóstico del Problema: Formulario Manual de Leads

### Causa Raíz Identificada (con evidencia)

He analizado el flujo completo desde `ManualLeadEntryPage.tsx` hasta la base de datos y encontré **3 problemas principales**:

---

### PROBLEMA 1: `extraMetadata` NO SE PROPAGA a Step4Results (V2)

**Archivo afectado:** `src/features/valuation/components/UnifiedCalculator.tsx` y `src/components/valuation-v2/StepContentV2.tsx`

**Evidencia:**
- En `UnifiedCalculator.tsx` líneas 288-299, cuando renderiza `StepContentV2` para la versión V2, **NO pasa** las props `sourceProject` ni `extraMetadata`:

```typescript
// UnifiedCalculator.tsx - V2 Renderer (líneas 288-299)
<StepContentV2
  currentStep={calculator.currentStep}
  companyData={calculator.companyData}
  updateField={trackedUpdateField}
  result={calculator.result}
  isCalculating={calculator.isCalculating}
  resetCalculator={calculator.resetCalculator}
  showValidation={calculator.showValidation}
  getFieldState={getCompatibleFieldState}
  handleFieldBlur={trackedHandleFieldBlur}
  errors={getCompatibleErrors()}
  // ❌ FALTAN: sourceProject, extraMetadata
/>
```

- Comparando con V1 (líneas 232-246), SÍ pasa `extraMetadata`:

```typescript
// V1 - SÍ pasa extraMetadata
extraMetadata={extraMetadata}
```

- `StepContentV2.tsx` NO declara `sourceProject` ni `extraMetadata` en su interface.

**Resultado:** Los datos `leadSource` y `leadSourceDetail` del formulario manual **NUNCA llegan a Step4Results**.

---

### PROBLEMA 2: `saveValuation` NO envía `sourceProject` ni metadatos de lead

**Archivo afectado:** `src/hooks/useOptimizedSupabaseValuation.tsx` (líneas 327-343)

**Evidencia:**
El `finalData` enviado al edge function `update-valuation` **no incluye**:
- `source_project`
- `lead_source` 
- `lead_source_detail`

```typescript
const finalData = {
  // Core data
  contact_name: companyData.contactName || '',
  company_name: companyData.companyName || '',
  // ... más campos
  valuation_status: 'completed',
  completion_percentage: 100
  // ❌ FALTA: source_project, lead_source, lead_source_detail
};
```

---

### PROBLEMA 3: Faltan columnas en la base de datos

**Evidencia:** Query a `information_schema.columns` muestra:
- ✅ `source_project` existe
- ❌ `lead_source` NO existe
- ❌ `lead_source_detail` NO existe

La edge function `update-valuation` tiene un whitelist de campos permitidos que **NO incluye** estos campos nuevos.

---

### PROBLEMA 4: Edge Function `update-valuation` no permite los nuevos campos

**Archivo afectado:** `supabase/functions/update-valuation/index.ts` (líneas 23-65)

**Evidencia:** El `ALLOWED_FIELDS` Set no incluye:
- `source_project`
- `lead_source`
- `lead_source_detail`

---

## Plan de Fix (Mínimo y Robusto)

### Paso 1: Migración SQL - Añadir columnas faltantes

```sql
ALTER TABLE company_valuations
ADD COLUMN IF NOT EXISTS lead_source TEXT,
ADD COLUMN IF NOT EXISTS lead_source_detail TEXT;

COMMENT ON COLUMN company_valuations.lead_source IS 'Canal de origen del lead (meta-ads, google-ads, etc.)';
COMMENT ON COLUMN company_valuations.lead_source_detail IS 'Detalle adicional del origen (campaña, referido, etc.)';
```

### Paso 2: Actualizar Edge Function `update-valuation`

Añadir los nuevos campos al `ALLOWED_FIELDS`:

```typescript
const ALLOWED_FIELDS = new Set([
  // ... campos existentes ...
  "source_project",      // AÑADIR
  "lead_source",         // AÑADIR
  "lead_source_detail",  // AÑADIR
]);
```

### Paso 3: Actualizar `StepContentV2.tsx`

Añadir props `sourceProject` y `extraMetadata` a la interface y pasarlas a `Step4Results`:

```typescript
interface StepContentProps {
  // ... props existentes ...
  sourceProject?: string;
  extraMetadata?: {
    leadSource?: string;
    leadSourceDetail?: string;
  };
}

// En case 2:
<Step4Results 
  result={result}
  companyData={companyData}
  isCalculating={isCalculating}
  resetCalculator={resetCalculator}
  uniqueToken={uniqueToken}
  sourceProject={sourceProject}      // AÑADIR
  extraMetadata={extraMetadata}      // AÑADIR
/>
```

### Paso 4: Actualizar `UnifiedCalculator.tsx` (renderV2)

Pasar las props faltantes a `StepContentV2`:

```typescript
<StepContentV2
  // ... props existentes ...
  sourceProject={config.sourceProject}  // AÑADIR
  extraMetadata={extraMetadata}         // AÑADIR
/>
```

### Paso 5: Actualizar `useOptimizedSupabaseValuation.tsx`

Incluir los nuevos campos en el `finalData`:

```typescript
const finalData = {
  // ... campos existentes ...
  source_project: options?.sourceProject || 'capittal-main',
  lead_source: options?.leadSource || null,
  lead_source_detail: options?.leadSourceDetail || null,
};
```

---

## Flujo Corregido

```text
ManualLeadEntryPage
    │
    ├── leadSource: "meta-ads"
    └── leadSourceDetail: "Campaña Valoración 2025"
         │
         ▼
    UnifiedCalculator (extraMetadata)
         │
         ▼
    StepContentV2 (sourceProject + extraMetadata) ← FIX 3 & 4
         │
         ▼
    Step4Results (extraMetadata)
         │
         ▼
    saveValuation(options: {sourceProject, leadSource, leadSourceDetail}) ← FIX 5
         │
         ▼
    Edge Function: update-valuation (ALLOWED_FIELDS incluye nuevos campos) ← FIX 2
         │
         ▼
    DB: company_valuations (lead_source, lead_source_detail) ← FIX 1
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `company_valuations` (tabla) | Añadir columnas: `lead_source`, `lead_source_detail` |
| `supabase/functions/update-valuation/index.ts` | Añadir campos al ALLOWED_FIELDS |
| `src/components/valuation-v2/StepContentV2.tsx` | Añadir props y pasarlas a Step4Results |
| `src/features/valuation/components/UnifiedCalculator.tsx` | Pasar props a StepContentV2 en renderV2() |
| `src/hooks/useOptimizedSupabaseValuation.tsx` | Incluir source_project, lead_source, lead_source_detail en finalData |

---

## Pruebas Obligatorias Post-Fix

1. **Test con datos válidos:**
   - Ir a `/admin/calculadora-manual`
   - Seleccionar origen "Meta Ads", detalle "Campaña Test"
   - Rellenar formulario y enviar
   - Verificar en DB: `SELECT source_project, lead_source, lead_source_detail FROM company_valuations ORDER BY created_at DESC LIMIT 1`
   - Esperado: `manual-admin-entry`, `meta-ads`, `Campaña Test`

2. **Test sin metadatos:**
   - Usar calculadora normal en `/lp/calculadora`
   - Verificar que `lead_source` y `lead_source_detail` quedan NULL
   - Verificar que `source_project` es `lp-calculadora-principal`

3. **Verificar UI:**
   - Toast de confirmación "Datos guardados"
   - Sin errores en consola
