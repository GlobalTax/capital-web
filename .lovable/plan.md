

## Fix: Mostrar valores financieros originales del usuario en emails de notificación

### Problema

Los emails de notificación de formularios muestran valores de Facturación y EBITDA incorrectos (ej: -500 € y -100 € en vez de lo que introdujo el usuario). El sistema actual pasa los valores por `formatCurrency()` que parsea y transforma los strings, potencialmente alterando los datos originales.

### Solución

**`supabase/functions/send-form-notifications/index.ts`**

1. **Preservar valores originales para el email**: Antes de llamar a `upsertLeadFromForm` (que puede mutar/ignorar valores), guardar los valores raw del formulario. Luego, al generar el template del email, inyectar `_rawRevenue` y `_rawEbitda` con los valores originales.

2. **Modificar `getFinancialDataSection`**: Usar los valores raw (`data._rawRevenue`, `data._rawEbitda`) cuando existan, mostrándolos directamente con `formatCurrency()`. Esto asegura que el email muestra exactamente lo que el usuario introdujo.

3. **Proteger `formatCurrency` contra negativos**: Añadir `Math.abs()` al formatear, ya que los valores financieros de formulario nunca deberían ser negativos en el email de notificación. Si el valor original era negativo, el email lo mostrará como positivo pero con una nota "(valor introducido como negativo)".

### Cambios concretos

```typescript
// En handler(), antes de generar templates (línea ~1436):
const rawRevenue = formData.revenue || formData.annualRevenue;
const rawEbitda = formData.ebitda;

const adminTemplate = getEmailTemplate(formType, { 
  email, fullName, ...formData,
  _rawRevenue: rawRevenue,
  _rawEbitda: rawEbitda,
  _crmLink: crmLink,
});
```

```typescript
// En getFinancialDataSection, usar el valor raw si existe:
const revenueValue = data._rawRevenue || data.revenue || data.annualRevenue;
const ebitdaValue = data._rawEbitda || data.ebitda;

// Y en formatCurrency, proteger contra negativos:
const formatCurrency = (amount) => {
  // ... parsing existente ...
  return new Intl.NumberFormat('es-ES', {...}).format(Math.abs(num));
};
```

### Archivo afectado
- `supabase/functions/send-form-notifications/index.ts`

