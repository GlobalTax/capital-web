

## Arreglar calculo de escenarios: usar offsets de la campana en vez de hardcodear +/-1

### Problema
Los escenarios Conservador y Optimista se calculan con offsets hardcodeados (`multipleUsed - 1` / `multipleUsed + 1`) en lugar de usar los valores `multiple_low` y `multiple_high` que ya existen en la tabla `valuation_campaigns`.

Ejemplo real: campaña "Outbound Asesorias Cataluña" tiene `custom_multiple=1.3`, `multiple_low=1.1`, `multiple_high=1.5`. Pero el codigo calcula `1.3-1=0.3` y `1.3+1=2.3` en vez de usar 1.1 y 1.5.

**Nota importante**: La tabla `valuation_config` no existe en la base de datos. Los offsets correctos ya estan en `valuation_campaigns.multiple_low` y `valuation_campaigns.multiple_high`.

### Donde esta el problema (3 sitios)

**1. `ReviewCalculateStep.tsx` - Calcular pendientes (lineas 97-98)**
```typescript
// ACTUAL (mal):
const effectiveLow = multipleUsed - 1;
const effectiveHigh = multipleUsed + 1;

// CORRECTO:
const effectiveLow = campaign.multiple_low || (multipleUsed - 1);
const effectiveHigh = campaign.multiple_high || (multipleUsed + 1);
```

**2. `ReviewCalculateStep.tsx` - Recalcular todas (lineas 291-292)**
```typescript
// ACTUAL (mal):
const effectiveLow = multipleUsed - 1;
const effectiveHigh = multipleUsed + 1;

// CORRECTO:
const effectiveLow = campaign.multiple_low || (multipleUsed - 1);
const effectiveHigh = campaign.multiple_high || (multipleUsed + 1);
```

**3. `professionalValuationCalculation.ts` (lineas 159-160)**
```typescript
// ACTUAL (mal):
const effectiveLow = customMultiple ? customMultiple - 1 : multipleLow;
const effectiveHigh = customMultiple ? customMultiple + 1 : multipleHigh;

// CORRECTO: aceptar offsets opcionales
```

### Solucion

**Archivo 1: `src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx`**

Cambiar las 2 funciones (`handleCalculateAll` y `handleRecalculateAll`) para leer `campaign.multiple_low` y `campaign.multiple_high`:

```typescript
// En ambas funciones, para el caso isRevenue:
const effectiveLow = campaign.multiple_low || (multipleUsed - 1);
const effectiveHigh = campaign.multiple_high || (multipleUsed + 1);

// Para el caso EBITDA, pasar los multiplos de campana a calculateProfessionalValuation:
// Añadir parametros opcionales multipleLowOverride y multipleHighOverride
```

**Archivo 2: `src/utils/professionalValuationCalculation.ts`**

Ampliar `calculateProfessionalValuation` para aceptar `multipleLowOverride` y `multipleHighOverride` opcionales:

```typescript
export function calculateProfessionalValuation(
  financialYears: FinancialYear[],
  adjustments: NormalizationAdjustment[],
  sector: string,
  customMultiple?: number,
  multipleLowOverride?: number,  // NUEVO
  multipleHighOverride?: number  // NUEVO
): ValuationCalculationResult {
  // ...
  const effectiveLow = multipleLowOverride || (customMultiple ? customMultiple - 1 : multipleLow);
  const effectiveHigh = multipleHighOverride || (customMultiple ? customMultiple + 1 : multipleHigh);
  // ...
}
```

Y actualizar las llamadas en `ReviewCalculateStep.tsx` para pasar `campaign.multiple_low` y `campaign.multiple_high`.

**Archivo 3 (ya correcto): `ProcessSendStep.tsx`**

La funcion `mapToPdfData` ya usa `campaign.multiple_low || (multipleUsed - 1)` -- no necesita cambios.

### Archivos a modificar
- `src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx` (2 bloques: calcular y recalcular)
- `src/utils/professionalValuationCalculation.ts` (ampliar firma de funcion)

### Resultado esperado
Con campana `custom_multiple=1.3`, `multiple_low=1.1`, `multiple_high=1.5` y facturacion 3.034.205:
- Val. Baja: 3.034.205 x 1.1 = 3.337.626
- Val. Central: 3.034.205 x 1.3 = 3.944.467
- Val. Alta: 3.034.205 x 1.5 = 4.551.308

No se necesitan cambios de base de datos ni crear tablas nuevas.
