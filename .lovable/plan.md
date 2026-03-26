

## Plan: Mostrar Facturación y EBITDA en todos los tipos de leads

### Problema detectado

Varios tipos de leads muestran "—" en Facturación y EBITDA porque:

1. **`contact_leads`** no tiene columnas `revenue` ni `ebitda` → siempre muestra "—" salvo que tenga empresa vinculada con datos
2. **`sell_leads`** no tiene columnas `revenue` ni `ebitda` → siempre muestra "—"
3. **`general_contact_leads`** tiene `annual_revenue` y `ebitda`, pero el transform usa `lead.revenue` en vez de `lead.annual_revenue` → no detecta el dato
4. **`sell_leads`** usa origin `'general'` que mapea a la tabla `general_contact_leads` para updates inline → las ediciones manuales de revenue/ebitda fallan silenciosamente

### Cambios

#### 1. Migración de base de datos
- Añadir columnas `revenue NUMERIC` y `ebitda NUMERIC` a `contact_leads`
- Añadir columnas `revenue NUMERIC` y `ebitda NUMERIC` a `sell_leads`

#### 2. Transform de `general_contact_leads` — `useContacts.ts`
- En `transformLegacyLead`, mapear `lead.annual_revenue` a `revenue` cuando `lead.revenue` no existe

#### 3. Origin diferenciado para `sell_leads` — `useContacts.ts`
- Cambiar el origin de `sell_leads` de `'general'` a `'sell'` (o mantener `'general'` pero añadir una propiedad `sourceTable` para el update inline)
- Opción más simple: añadir `'sell_lead'` al `tableMap` en `useContactInlineUpdate` apuntando a `sell_leads`

#### 4. Capacidades de tabla — `useInlineUpdate.ts`
- Añadir `sell_leads` a `tableCapabilities`
- Verificar que el campo `revenue`/`ebitda` se mapee correctamente en `fieldMap` para las tablas que usan `annual_revenue`

#### 5. Tipo Contact — `types.ts`
- Añadir `'sell'` como origin válido si se crea uno nuevo (o reutilizar `'general'` con sourceTable)

### Archivos a modificar
- **Migration SQL**: añadir columnas a `contact_leads` y `sell_leads`
- `src/components/admin/contacts-v2/hooks/useContacts.ts` — fix transform para `annual_revenue`, origin para sell_leads
- `src/hooks/useInlineUpdate.ts` — añadir sell_leads al tableMap y capabilities
- `src/components/admin/contacts-v2/types.ts` — verificar/actualizar ContactOrigin

