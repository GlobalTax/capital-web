

## Mostrar siempre Facturación y EBITDA en la tabla de contactos

### Diagnóstico

La tabla de contactos ya tiene las columnas Facturación y EBITDA, pero muchos leads muestran `-` porque:

1. **`contact_leads`** no tiene columnas `revenue`/`ebitda` — solo obtiene datos del join con `empresas` (si hay `empresa_id` vinculada)
2. **`company_valuations`** sí tiene `revenue`/`ebitda`, pero los leads de tipo `contact` no acceden a estos datos
3. **`professional_valuations`** tiene `revenue`, `ebitda` y `valuation_central`, vinculable via `linked_lead_id`, pero nunca se consulta como fallback

### Cambios

**`src/components/admin/contacts-v2/hooks/useContacts.ts`** — Añadir fallback de datos financieros

1. **Fetch adicional**: Cargar `professional_valuations` (solo campos financieros) en paralelo con las demás queries:
   ```
   supabase.from('professional_valuations')
     .select('linked_lead_id, linked_lead_type, revenue, ebitda, valuation_central')
     .not('linked_lead_id', 'is', null)
   ```

2. **Crear mapa de lookup**: `proValMap = Map<lead_id, {revenue, ebitda, valuation}>`

3. **Enriquecer transforms**: En `transformContact` y `transformValuation`, añadir un tercer nivel de fallback:
   - `revenue = lead.revenue || empresas.facturacion || proValMap[lead.id]?.revenue`
   - `ebitda = lead.ebitda || empresas.ebitda || proValMap[lead.id]?.ebitda`
   - `final_valuation = lead.final_valuation || proValMap[lead.id]?.valuation_central`

4. **Pasar el mapa a los transforms**: Añadir `proValMap` como parámetro a las funciones `transformContact`, `transformValuation`, `transformAdvisor` y `transformLegacyLead`

### Resultado
Cada contacto mostrará Facturación y EBITDA siempre que el dato exista en cualquier fuente: el propio lead, la empresa vinculada, o la valoración profesional asociada. Solo mostrará `-` cuando realmente no exista el dato en ningún sitio.

