
# Valoracion por Facturacion ademas de EBITDA

## Resumen

Anadir un selector de tipo de valoracion en las campanas outbound que permita elegir entre "Multiplo de EBITDA" (actual) y "Multiplo de Facturacion" (nuevo). Los calculos, la importacion Excel, la tabla de revision y el PDF se adaptaran segun el tipo elegido.

## Cambios planificados

### 1. Migracion de base de datos

Anadir columna `valuation_type` a la tabla `valuation_campaigns`:

```text
ALTER TABLE valuation_campaigns
  ADD COLUMN valuation_type text NOT NULL DEFAULT 'ebitda_multiple'
  CHECK (valuation_type IN ('ebitda_multiple', 'revenue_multiple'));
```

Esto garantiza backward compatibility: todas las campanas existentes seran `ebitda_multiple` por defecto.

### 2. Tipo TypeScript: `ValuationCampaign` (useCampaigns.ts)

Anadir `valuation_type: 'ebitda_multiple' | 'revenue_multiple'` al interface `ValuationCampaign`.

### 3. Selector en CampaignConfigStep.tsx

Anadir un RadioGroup (igual al existente de `years_mode`) dentro de la card "Plantilla de Valoracion" con dos opciones:
- **Multiplo de EBITDA**: "Valoracion = EBITDA x Multiplo. Metodo mas comun para empresas rentables."
- **Multiplo de Facturacion**: "Valoracion = Facturacion x Multiplo. Util para empresas en crecimiento o sectores donde la facturacion es mas relevante."

Tambien cambiar el label "Multiplo EBITDA (opcional)" a label dinamico segun tipo.

### 4. Calculo en ReviewCalculateStep.tsx

Modificar `handleCalculateAll` y `handleRecalculateAll` para que, cuando `campaign.valuation_type === 'revenue_multiple'`, usen `revenue` en vez de `ebitda` como base del calculo:

- Obtener el valor base: `const baseValue = campaign.valuation_type === 'revenue_multiple' ? c.revenue : c.ebitda`
- Pasar este valor a `calculateProfessionalValuation` o calcular directamente: `baseValue * multiple`

Dado que `calculateProfessionalValuation()` esta disenada para EBITDA (usa `getLatestEbitda`), para revenue se hara el calculo directo en el step:

```text
if (campaign.valuation_type === 'revenue_multiple') {
  const baseValue = latestRevenue;
  const multipleUsed = customMultiple || campaignMultiple || 2.0;
  const effectiveLow = multipleUsed - 1;
  const effectiveHigh = multipleUsed + 1;
  valuationLow = baseValue * effectiveLow;
  valuationCentral = baseValue * multipleUsed;
  valuationHigh = baseValue * effectiveHigh;
  normalizedEbitda = baseValue; // Reusar campo para "base value"
} else {
  // Flujo EBITDA existente via calculateProfessionalValuation()
}
```

Tambien actualizar la tabla para mostrar "Facturacion" o "EBITDA" en el header segun tipo.

### 5. Excel en CompaniesStep.tsx

- Cambiar el boton de descarga de plantilla para que, si `valuation_type === 'revenue_multiple'`, genere columnas sin EBITDA obligatorio (solo Facturacion).
- En la validacion de filas importadas, si es revenue_multiple, no requerir EBITDA (pero si Facturacion).
- El boton "Excluir sin EBITDA" cambiara a "Excluir sin Facturacion" cuando el tipo sea revenue.

### 6. PDF en ProcessSendStep.tsx (mapToPdfData)

Modificar `mapToPdfData` para que cuando `campaign.valuation_type === 'revenue_multiple'`:
- Use `revenue` como `normalizedEbitda` (el campo que el PDF usa como base de calculo)
- Recalcule valoraciones con revenue en vez de ebitda
- Pase un flag o campo adicional para que el PDF muestre "Facturacion" en vez de "EBITDA"

### 7. PDF Component (ProfessionalValuationPDF.tsx)

Anadir soporte para un campo opcional `valuationMethod` en ProfessionalValuationData:

```text
valuationMethod?: 'ebitda_multiple' | 'revenue_multiple';
```

En MethodologyPage:
- Cambiar titulo "Metodo de Multiplos EBITDA" a "Metodo de Multiplos de Facturacion" si aplica
- Cambiar label "EBITDA Normalizado" a "Facturacion" si aplica
- Cambiar texto descriptivo del metodo

### 8. ProfessionalValuationData type

Anadir campo opcional:

```text
valuationMethod?: 'ebitda_multiple' | 'revenue_multiple';
```

## Archivos a modificar

1. **Nueva migracion SQL** - Columna `valuation_type`
2. `src/hooks/useCampaigns.ts` - Tipo TS
3. `src/types/professionalValuation.ts` - Campo `valuationMethod`
4. `src/components/admin/campanas-valoracion/steps/CampaignConfigStep.tsx` - RadioGroup selector + labels dinamicos
5. `src/components/admin/campanas-valoracion/steps/ReviewCalculateStep.tsx` - Calculo con revenue, headers tabla, boton excluir
6. `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx` - Plantilla Excel, validacion importacion
7. `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` - mapToPdfData con revenue
8. `src/components/pdf/ProfessionalValuationPDF.tsx` - Labels dinamicos EBITDA/Facturacion

## Impacto y compatibilidad

- Campanas existentes no se ven afectadas (default `ebitda_multiple`)
- La formula sigue siendo `Valor Base x Multiplo` para ambos tipos
- Los multiplos por defecto para facturacion suelen ser mas bajos (1-3x vs 5-9x para EBITDA), pero el usuario los configura manualmente
- El PDF indicara claramente que metodo se uso
