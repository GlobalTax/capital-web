
# Fix: Calculo Incorrecto de Valoraciones en Rango de Multiplos

## Diagnostico

El bug esta en `src/components/admin/professional-valuations/ProfessionalValuationForm.tsx`, lineas 168-176, en el `useMemo` llamado `dataWithCalculations`.

### Flujo actual (con bug)

1. `calculateProfessionalValuation()` calcula `valuationLow` y `valuationHigh` usando los multiplos **del sector** (de la matriz EBITDA), NO los multiplos personalizados del usuario.
2. `dataWithCalculations` asigna estos valores directamente: `valuationLow: calculatedValues.valuationLow || baseData.valuationLow`
3. Cuando el usuario configura multiplos custom (ej: 7.0x - 9.0x con base 8.0x), el calculo sigue usando los multiplos del sector (ej: 4.5x - 6.5x), produciendo valores incorrectos.
4. El PDF recibe `data.valuationLow` / `data.valuationHigh` ya con valores incorrectos.

### Ejemplo del bug

```text
EBITDA normalizado: 1.533.543
Multiplos del usuario: 7.0x (low) / 8.0x (base) / 9.0x (high)
Multiplos del sector (matriz): ~5.5x (low) / ~6.5x (high)

Resultado actual (INCORRECTO):
  Conservador = 1.533.543 x 5.5 = 8.434.487   (usa multiplo sector)
  Base        = 1.533.543 x 8.0 = 12.268.344   (usa multiplo usuario - OK)
  Optimista   = 1.533.543 x 6.5 = 9.968.030    (usa multiplo sector)

Resultado correcto:
  Conservador = 1.533.543 x 7.0 = 10.734.801
  Base        = 1.533.543 x 8.0 = 12.268.344
  Optimista   = 1.533.543 x 9.0 = 13.801.887
```

## Solucion

### Archivo: `src/components/admin/professional-valuations/ProfessionalValuationForm.tsx`

Modificar el `useMemo` `dataWithCalculations` (lineas 157-179) para recalcular `valuationLow` y `valuationHigh` usando los multiplos **efectivos** (los del usuario si existen, los del sector si no):

```typescript
const dataWithCalculations = useMemo((): ProfessionalValuationData => {
  const baseData = { ...data };

  if (!baseData.ebitdaMultipleUsed || baseData.ebitdaMultipleUsed <= 0) {
    baseData.ebitdaMultipleUsed = 6;
  }

  if (!calculatedValues) {
    return baseData;
  }

  // Usar multiplos efectivos: los del usuario si existen, los calculados si no
  const effectiveLow = baseData.ebitdaMultipleLow ?? calculatedValues.multipleLow;
  const effectiveHigh = baseData.ebitdaMultipleHigh ?? calculatedValues.multipleHigh;
  const normalizedEbitda = calculatedValues.normalizedEbitda;

  // RECALCULAR valoraciones con multiplos efectivos (EBITDA x Multiplo)
  const recalcValuationLow = normalizedEbitda * effectiveLow;
  const recalcValuationHigh = normalizedEbitda * effectiveHigh;
  const recalcValuationCentral = normalizedEbitda * baseData.ebitdaMultipleUsed;

  return {
    ...baseData,
    reportedEbitda: getLatestEbitda(data.financialYears),
    normalizedEbitda,
    ebitdaMultipleLow: effectiveLow,
    ebitdaMultipleHigh: effectiveHigh,
    valuationLow: recalcValuationLow,
    valuationHigh: recalcValuationHigh,
    valuationCentral: recalcValuationCentral,
    sensitivityMatrix: calculatedValues.sensitivityMatrix || baseData.sensitivityMatrix,
  };
}, [data, calculatedValues]);
```

### Que cambia exactamente

- Antes: `valuationLow = calculatedValues.valuationLow` (usa multiplos del sector)
- Despues: `valuationLow = normalizedEbitda * effectiveLow` (usa multiplos del usuario si existen)

### Por que el valor Base era correcto

`valuationCentral` se calculaba con `customMultiple` (el multiplo del usuario) en `calculateProfessionalValuation()` linea 156, por eso el valor central siempre era correcto. El bug solo afectaba a los valores conservador y optimista.

## Archivos afectados

Solo 1 archivo: `src/components/admin/professional-valuations/ProfessionalValuationForm.tsx`

## Impacto

- El PDF mostrara los 3 escenarios con valores correctos (EBITDA x Multiplo correspondiente)
- La vista previa (PreviewStep) tambien se corrige automaticamente porque usa `dataWithCalculations`
- El QuickEditSheet ya calcula correctamente (lineas 42-43) pero sus valores se perdian al volver al flujo principal
- No se rompe nada mas: solo se corrige la fuente de verdad de los valores de rango
