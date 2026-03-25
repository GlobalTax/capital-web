

## Edición inline de Facturación y EBITDA en la tabla de Leads

### Objetivo
Permitir editar Facturación y EBITDA directamente haciendo clic en la celda (incluyendo las que muestran `-`), igual que ya funciona el Estado, Canal o Fecha.

### Cambios

**1. Crear componente `EditableCurrencyCell.tsx`** (`src/components/admin/shared/`)

Un campo editable inline similar a `EditableDateCell`:
- Modo display: muestra el valor formateado (`500k€`) o `—` si vacío
- Al hacer clic: input numérico con formato español (puntos como miles)
- Al hacer blur o Enter: guarda y vuelve a modo display
- Props: `value`, `onSave(newValue: number | null)`, `placeholder`, `displayClassName`

**2. `src/components/admin/contacts-v2/ContactRow.tsx`**

- Importar `EditableCurrencyCell`
- Reemplazar las celdas estáticas de Revenue (línea 236-238) y EBITDA (línea 241-243) por `EditableCurrencyCell`
- Añadir handlers `handleRevenueChange` y `handleEbitdaChange` que:
  - Llamen a `onPatchContact` para actualización optimista local
  - Persistan con `updateField(id, origin, 'revenue'/'ebitda', value)`

**3. `src/hooks/useInlineUpdate.ts`** (verificar)

Confirmar que el hook `useContactInlineUpdate` soporta los campos `revenue` y `ebitda` para las tablas `contact_leads` y `company_valuations`. Si hay un whitelist de campos, añadirlos.

### Resultado
Todas las celdas de Facturación y EBITDA serán clickables. Las vacías mostrarán `—` pero al hacer clic se podrá escribir el valor. Los datos se guardan en la tabla original del lead.

