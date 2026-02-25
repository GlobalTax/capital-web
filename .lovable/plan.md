

# Fix: Calculo Incorrecto de Valoraciones en Campanas Outbound

## Diagnostico confirmado

El bug esta en `calculateProfessionalValuation()` en `src/utils/professionalValuationCalculation.ts`, lineas 159-161:

```text
valuationLow  = normalizedEbitda * multipleLow   <-- multipleLow viene del SECTOR (matriz)
valuationHigh = normalizedEbitda * multipleHigh   <-- multipleHigh viene del SECTOR (matriz)
valuationCentral = normalizedEbitda * customMultiple  <-- OK, usa el del usuario
```

Cuando el usuario pone multiplo 7.0x, el sistema calcula:
- Central: EBITDA x 7.0 (correcto)
- Low: EBITDA x 3.5 (sector, incorrecto - deberia ser 6.0)
- High: EBITDA x 5.5 (sector, incorrecto - deberia ser 8.0)

Este bug afecta a dos flujos:
1. **ReviewCalculateStep** (linea 98-100): guarda `result.valuationLow/High` (incorrectos) en DB
2. **ProcessSendStep > mapToPdfData** (linea 57-59): lee `c.valuation_low/high` de DB (ya incorrectos)

El fix previo en `ProfessionalValuationForm.tsx` solo arreglo las valoraciones profesionales individuales, no las campanas outbound.

## Solucion (3 cambios)

### 1. Arreglar `calculateProfessionalValuation()` (raiz del problema)

**Archivo:** `src/utils/professionalValuationCalculation.ts`

Cuando se pasa un `customMultiple`, derivar low/high como `customMultiple - 1` y `customMultiple + 1` en vez de usar los multiplos del sector:

```typescript
// Lineas 153-161, ANTES:
const multipleUsed = customMultiple ?? (multipleLow + multipleHigh) / 2;
const valuationLow = calculateValuation(normalizedEbitda, multipleLow);
const valuationHigh = calculateValuation(normalizedEbitda, multipleHigh);

// DESPUES:
const multipleUsed = customMultiple ?? (multipleLow + multipleHigh) / 2;
const effectiveLow = customMultiple ? customMultiple - 1 : multipleLow;
const effectiveHigh = customMultiple ? customMultiple + 1 : multipleHigh;
const valuationLow = calculateValuation(normalizedEbitda, effectiveLow);
const valuationHigh = calculateValuation(normalizedEbitda, effectiveHigh);
```

Tambien actualizar los valores retornados `multipleLow`/`multipleHigh` para que reflejen los efectivos.

### 2. Boton "Recalcular todas las valoraciones"

**Archivo:** `src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx`

Anadir un boton que recalcule TODAS las empresas (no solo las pendientes). El `handleCalculateAll` actual solo procesa `status === 'pending'`. Se anadira una funcion `handleRecalculateAll` que:
- Itera TODAS las empresas (excepto excluidas)
- Llama a `calculateProfessionalValuation()` con el multiplo custom
- Actualiza `valuation_low`, `valuation_central`, `valuation_high` en DB
- Muestra progreso y resultado

### 3. Doble seguridad en PDF: recalcular en `mapToPdfData`

**Archivo:** `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx`

En `mapToPdfData()` (linea 42-67), recalcular `valuationLow`/`valuationHigh` en vez de leer de DB:

```typescript
const normalizedEbitda = c.normalized_ebitda || c.ebitda;
const multipleUsed = c.multiple_used || 6;
const effectiveLow = campaign.multiple_low || (multipleUsed - 1);
const effectiveHigh = campaign.multiple_high || (multipleUsed + 1);

return {
  ...existingFields,
  valuationLow: normalizedEbitda * effectiveLow,
  valuationCentral: normalizedEbitda * multipleUsed,
  valuationHigh: normalizedEbitda * effectiveHigh,
  ebitdaMultipleLow: effectiveLow,
  ebitdaMultipleHigh: effectiveHigh,
};
```

## Archivos afectados

1. `src/utils/professionalValuationCalculation.ts` - Fix del calculo raiz
2. `src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx` - Boton recalcular
3. `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` - Doble seguridad en PDF

## Verificacion esperada

Con EBITDA = 41.738 y multiplo = 7.0:
- Val. Baja: 41.738 x 6.0 = 250.428
- Val. Central: 41.738 x 7.0 = 292.166
- Val. Alta: 41.738 x 8.0 = 333.904

Con EBITDA = 1.533.543 y multiplo = 8.0:
- Conservador: 1.533.543 x 7.0 = 10.734.801
- Base: 1.533.543 x 8.0 = 12.268.344
- Optimista: 1.533.543 x 9.0 = 13.801.887
