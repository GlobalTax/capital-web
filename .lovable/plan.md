

## Plan: Añadir tabla de empresas con respuesta al informe outbound

### Objetivo

Agregar una nueva sección al email automático de `send-outbound-report` que muestre una tabla con las empresas cuyo `seguimiento_estado` es distinto de `sin_respuesta` (y no es null), incluyendo nombre de empresa, estado de seguimiento y notas.

### Cambios en `supabase/functions/send-outbound-report/index.ts`

**1. Ampliar la query de companies** (línea ~329-331):
- Añadir `client_company` y `seguimiento_notas` al `select` de `valuation_campaign_companies`
- Actualizar la interfaz `RawCompany` para incluir estos campos

**2. Nueva función `renderRespondedCompaniesTable`**:
- Filtra todas las companies donde `seguimiento_estado` no sea `sin_respuesta` ni null
- Genera una tabla HTML con columnas: **Empresa**, **Campaña**, **Estado** (con badge de color), **Notas**
- Los estados se formatean con etiquetas legibles (interesado → "Interesado", reunion_agendada → "Reunión", no_interesado → "No interesado") y colores correspondientes

**3. Insertar la tabla en el HTML** (línea ~366-373):
- Añadir la sección después de las KPIs globales y antes del footer
- Solo se renderiza si hay al menos una empresa con respuesta

### Resultado
El email diario incluirá una tabla tipo:

```text
┌──────────────────┬──────────────┬─────────────┬────────────────┐
│ Empresa          │ Campaña      │ Estado      │ Notas          │
├──────────────────┼──────────────┼─────────────┼────────────────┤
│ Acme S.L.        │ Sector Salud │ Interesado  │ Llamar lunes   │
│ Beta Corp        │ Seguridad    │ Reunión     │ Demo agendada  │
└──────────────────┴──────────────┴─────────────┴────────────────┘
```

### Archivo a modificar
- `supabase/functions/send-outbound-report/index.ts`

