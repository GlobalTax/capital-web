

## Desacoplar campanas outbound de professional_valuations

### Problema actual
El paso de procesamiento (`ProcessSendStep`) crea un registro en la tabla `professional_valuations` para cada empresa de la campana, y luego usa ese ID para enviar el email. Esto mezcla las valoraciones de campanas outbound con las valoraciones profesionales individuales.

### Solucion
Eliminar la insercion en `professional_valuations` y llamar directamente a la Edge Function `send-professional-valuation-email` con los datos inline desde `valuation_campaign_companies`. La Edge Function ya acepta datos directos (no requiere un `valuationId`).

### Cambios

#### 1. ProcessSendStep.tsx - Fase 1 (Crear -> Preparar)
Actualmente la "Fase 1: Crear Valoraciones" inserta en `professional_valuations`. Se cambiara para:
- Renombrar a "Fase 1: Preparar envio"
- En lugar de insertar en `professional_valuations`, simplemente marcar el estado como `ready_to_send` en `valuation_campaign_companies`
- Eliminar la dependencia de `mapProfessionalValuationToDb` y `ProfessionalValuationData`
- Eliminar la referencia a `professional_valuation_id`

#### 2. ProcessSendStep.tsx - Fase 2 (Enviar)
Cambiar la llamada al edge function para enviar los datos directamente:

```typescript
// ANTES: usaba professional_valuation_id
await supabase.functions.invoke('send-professional-valuation-email', {
  body: { valuationId: c.professional_valuation_id },
});

// DESPUES: envia datos inline
await supabase.functions.invoke('send-professional-valuation-email', {
  body: {
    recipientEmail: c.client_email,
    recipientName: c.client_name,
    valuationData: {
      clientCompany: c.client_company,
      clientName: c.client_name,
      clientCif: c.client_cif,
      valuationCentral: c.valuation_central,
      valuationLow: c.valuation_low,
      valuationHigh: c.valuation_high,
      sector: campaign.sector,
      normalizedEbitda: c.normalized_ebitda,
      ebitdaMultipleUsed: c.multiple_used,
      financialYears: c.financial_years_data || [{ year: c.financial_year, revenue: c.revenue, ebitda: c.ebitda }],
    },
    advisorName: campaign.advisor_name,
    advisorEmail: campaign.advisor_email,
  },
});
```

#### 3. Simplificar el flujo
Al eliminar la fase intermedia de "crear valoracion profesional", el flujo pasa de:
- Calcular -> Crear en professional_valuations -> Enviar email

A:
- Calcular -> Enviar email directamente

Esto significa que las dos fases actuales se pueden fusionar en una sola, o bien mantener la Fase 1 como paso de validacion/preparacion antes del envio.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `ProcessSendStep.tsx` | Eliminar insert a `professional_valuations`, enviar datos inline al edge function |

### Lo que NO cambia
- La tabla `valuation_campaign_companies` sigue igual
- La Edge Function `send-professional-valuation-email` no necesita cambios (ya acepta datos inline)
- El hook `useCampaignCompanies` no cambia
- Los pasos anteriores (importacion, calculo, enriquecimiento IA) no cambian

