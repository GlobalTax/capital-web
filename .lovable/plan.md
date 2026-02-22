

# Fix PDF: Sector sin "(Otro)" + Rangos de Multiplos Correctos

## Problema

El PDF generado desde campanas outbound tiene dos bugs visibles:

1. **Sector**: Aparece "el sector de actividad (Otro)" con parentesis
2. **Rangos de multiplos**: Conservador y Optimista muestran `0.0x` porque `ebitdaMultipleLow` y `ebitdaMultipleHigh` no se pasan al componente PDF

## Causa Raiz

En `ProcessSendStep.tsx`, la funcion `mapToPdfData()` no mapea los campos `ebitdaMultipleLow` y `ebitdaMultipleHigh`. La campana tiene `multiple_low` y `multiple_high` a nivel de campana, pero no se pasan al PDF. Ademas, el sector se muestra tal cual sin limpiar el texto "(Otro)".

## Solucion (minima y segura)

### Cambio 1: `mapToPdfData` en ProcessSendStep.tsx

Anadir los campos faltantes usando los datos de la campana:

```typescript
ebitdaMultipleLow: campaign.multiple_low || undefined,
ebitdaMultipleHigh: campaign.multiple_high || undefined,
```

Si la campana no tiene `multiple_low`/`multiple_high`, calcular automaticamente con offset -1/+1 respecto al multiplo usado de la empresa.

### Cambio 2: Sector limpio en ProfessionalValuationPDF.tsx

En el texto de justificacion del multiplo (linea ~879), limpiar el nombre del sector:
- Quitar parentesis: `(Otro)` -> `Otro`
- Reemplazar "Otro" por el nombre real del sector o "Servicios Generales"

Esto se hace directamente en el componente PDF con una funcion helper simple (sin tabla de BD, sin async):

```typescript
function cleanSectorName(sector: string): string {
  let clean = sector.replace(/[()]/g, '').trim();
  if (clean.toLowerCase() === 'otro' || !clean) {
    return 'Servicios Generales';
  }
  return clean;
}
```

### Cambio 3: Fallback de rangos en ProfessionalValuationPDF.tsx

Anadir logica defensiva en la pagina de rangos (linea ~894-920) para que si `ebitdaMultipleLow`/`ebitdaMultipleHigh` son 0 o undefined, se calculen automaticamente como `base - 1` y `base + 1`:

```typescript
const baseMult = data.ebitdaMultipleUsed || 0;
const lowMult = data.ebitdaMultipleLow || (baseMult > 1 ? baseMult - 1 : baseMult * 0.85);
const highMult = data.ebitdaMultipleHigh || baseMult + 1;
const ebitda = data.normalizedEbitda || 0;
```

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `ProcessSendStep.tsx` | Anadir `ebitdaMultipleLow` y `ebitdaMultipleHigh` en `mapToPdfData` |
| `ProfessionalValuationPDF.tsx` | Helper `cleanSectorName` + fallback de rangos con offset +-1 |

## Lo que NO se toca

- Firma de funciones de generacion de PDF
- Sistema de descarga individual/masiva/ZIP
- Estructura general del PDF
- Estilos y diseno
- No se crea tabla `valuation_config` (innecesario para este fix)
- No se crea pagina admin de configuracion (se puede hacer despues si se necesita)

## Resultado esperado

- Sector "Otro" -> "Servicios Generales" en el texto
- Sector "Tecnologia" -> "Tecnologia" (sin cambios)
- Con multiplo base 8.0x -> Conservador: 7.0x, Base: 8.0x, Optimista: 9.0x
- Valoraciones calculadas correctamente con cada multiplo

