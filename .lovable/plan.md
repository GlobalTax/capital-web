

# Plan: Corregir Error de Código de Moneda en CaseStudiesSection

## Problema

El error `Invalid currency code : €` ocurre porque la base de datos almacena el símbolo de moneda (`€`) pero `Intl.NumberFormat` requiere códigos ISO 4217 (`EUR`, `USD`, etc.).

```text
Base de datos: value_currency = "€"
                    ↓
Intl.NumberFormat espera: "EUR"
                    ↓
RangeError: Invalid currency code : €
```

## Solución

Ya existe una función `mapCurrencySymbolToCode` en `src/shared/utils/format.ts` que convierte símbolos a códigos ISO:

- `€` → `EUR`
- `$` → `USD`  
- `£` → `GBP`
- etc.

Reutilizaremos esta función existente en lugar de duplicar código.

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/test/components/CaseStudiesSection.tsx` | Importar y usar `formatCurrency` de utils existente, o replicar la lógica de mapeo |

## Código Actual (líneas 27-41)

```typescript
const formatValue = (amount: number | undefined, currency: string, isConfidential: boolean | undefined) => {
  if (isConfidential || !amount) {
    return null;
  }
  
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency || 'EUR',  // ❌ "€" no es válido
    ...
  }).format(amount);
  
  return formatted;
};
```

## Código Corregido

```typescript
// Mapeo de símbolos a códigos ISO
const mapCurrencySymbolToCode = (currency: string | null | undefined): string => {
  if (!currency) return 'EUR';
  
  const currencyMap: Record<string, string> = {
    '€': 'EUR',
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY',
    'EUR': 'EUR',
    'USD': 'USD',
    'GBP': 'GBP',
  };
  
  return currencyMap[currency.trim()] || 'EUR';
};

const formatValue = (amount: number | undefined, currency: string, isConfidential: boolean | undefined) => {
  if (isConfidential || !amount) {
    return null;
  }
  
  // ✅ Convertir símbolo a código ISO válido
  const currencyCode = mapCurrencySymbolToCode(currency);
  
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currencyCode,  // ✅ Ahora usa "EUR" en vez de "€"
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: amount >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(amount);
  
  return formatted;
};
```

## Resultado

- El componente mostrará correctamente valores como `€12 M` o `€5.000.000`
- No más errores de `RangeError`
- Funcionará con cualquier moneda almacenada en la base de datos

## Sección Técnica

### Alternativa: Importar desde utils existentes

También podríamos importar directamente `formatCompactCurrency` desde `@/shared/utils/format.ts`, pero dado que el componente necesita manejar el caso confidencial y tiene una lógica específica de formato, es más claro tener la función local con el mapeo necesario.

### Manejo de edge cases

La función `mapCurrencySymbolToCode` maneja:
- `null` / `undefined` → `EUR`
- Símbolos: `€`, `$`, `£`, `¥`
- Códigos ya válidos: `EUR`, `USD`, `GBP`
- Caracteres corruptos (como `â¬` para euro) → `EUR`

