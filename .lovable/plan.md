
# Plan: Arreglo de Edición de Fecha de Registro en Leads

## Diagnóstico Técnico Confirmado

### Causa Raíz del Error en Bulk Update
La columna `lead_received_at` **solo existe en 2 de las 8 tablas de leads**:

| Tabla | Tiene `lead_received_at` |
|-------|-------------------------|
| `contact_leads` | ✅ Sí |
| `buyer_contacts` | ✅ Sí |
| `company_valuations` | ❌ NO |
| `general_contact_leads` | ❌ NO |
| `collaborator_applications` | ❌ NO |
| `acquisition_leads` | ❌ NO |
| `advisor_valuations` | ❌ NO |
| `company_acquisition_inquiries` | ❌ NO |

Cuando la Edge Function `bulk-update-contacts` recibe leads de múltiples orígenes y aplica:
```typescript
if (updates.lead_received_at !== undefined) {
  updatePayload.lead_received_at = updates.lead_received_at;
}
```
**Falla en tablas donde la columna no existe**, generando error de Postgres.

### Problema Secundario: Sin Edición Individual
La celda "F. Registro" en `ContactTableRow.tsx` (línea 218-222) es solo de lectura:
```tsx
<span className="text-[10px] text-muted-foreground">
  {format(new Date((contact as any).lead_received_at || contact.created_at), 'dd MMM yy')}
</span>
```
No tiene componente editable como las otras columnas.

---

## Solución Propuesta

### Fase 1: Migración de Base de Datos (Obligatoria)

Añadir la columna `lead_received_at` a todas las tablas de leads que no la tienen:

```sql
-- 1. Añadir columna a todas las tablas faltantes
ALTER TABLE public.company_valuations
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ;

ALTER TABLE public.general_contact_leads
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ;

ALTER TABLE public.collaborator_applications
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ;

ALTER TABLE public.acquisition_leads
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ;

ALTER TABLE public.advisor_valuations
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ;

ALTER TABLE public.company_acquisition_inquiries
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ;

-- 2. Migrar datos existentes (usar created_at como valor inicial)
UPDATE public.company_valuations SET lead_received_at = created_at WHERE lead_received_at IS NULL;
UPDATE public.general_contact_leads SET lead_received_at = created_at WHERE lead_received_at IS NULL;
UPDATE public.collaborator_applications SET lead_received_at = created_at WHERE lead_received_at IS NULL;
UPDATE public.acquisition_leads SET lead_received_at = created_at WHERE lead_received_at IS NULL;
UPDATE public.advisor_valuations SET lead_received_at = created_at WHERE lead_received_at IS NULL;
UPDATE public.company_acquisition_inquiries SET lead_received_at = created_at WHERE lead_received_at IS NULL;

-- 3. Establecer default para nuevos registros
ALTER TABLE public.company_valuations ALTER COLUMN lead_received_at SET DEFAULT now();
ALTER TABLE public.general_contact_leads ALTER COLUMN lead_received_at SET DEFAULT now();
ALTER TABLE public.collaborator_applications ALTER COLUMN lead_received_at SET DEFAULT now();
ALTER TABLE public.acquisition_leads ALTER COLUMN lead_received_at SET DEFAULT now();
ALTER TABLE public.advisor_valuations ALTER COLUMN lead_received_at SET DEFAULT now();
ALTER TABLE public.company_acquisition_inquiries ALTER COLUMN lead_received_at SET DEFAULT now();

-- 4. Crear índices para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_company_valuations_lead_received_at ON public.company_valuations(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_general_leads_lead_received_at ON public.general_contact_leads(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaborator_lead_received_at ON public.collaborator_applications(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_acquisition_lead_received_at ON public.acquisition_leads(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisor_lead_received_at ON public.advisor_valuations(lead_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_acq_lead_received_at ON public.company_acquisition_inquiries(lead_received_at DESC);
```

### Fase 2: Actualizar Edge Function (Validación Segura)

Modificar `bulk-update-contacts/index.ts` para incluir lista explícita de tablas que soportan `lead_received_at`:

```typescript
// Añadir nueva lista de tablas con lead_received_at
const tablesWithLeadReceivedAt = [
  'contact_leads',
  'company_valuations',
  'general_contact_leads',
  'collaborator_applications',
  'acquisition_leads',
  'advisor_valuations',
  'company_acquisition_inquiries',
  'buyer_contacts',
];

// En el payload builder:
if (updates.lead_received_at !== undefined && tablesWithLeadReceivedAt.includes(table)) {
  updatePayload.lead_received_at = updates.lead_received_at;
}
```

### Fase 3: Crear Componente de Edición de Fecha Individual

Nuevo archivo: `src/components/admin/shared/EditableDateCell.tsx`

```typescript
interface EditableDateCellProps {
  value: string | Date | null | undefined;
  onSave: (newDate: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  displayFormat?: string;
}

export const EditableDateCell: React.FC<EditableDateCellProps> = ({
  value,
  onSave,
  placeholder = "Fecha...",
  disabled = false,
  displayFormat = "dd MMM yy",
}) => {
  // Al hacer click: abrir popover con Calendar
  // Al seleccionar fecha: llamar onSave con ISO string
  // Mostrar loader mientras guarda
  // Rollback visual si error
};
```

### Fase 4: Integrar Edición Individual en Tabla

Modificar `ContactTableRow.tsx` líneas 218-223:

**Antes (solo lectura):**
```tsx
<span className="text-[10px] text-muted-foreground">
  {format(new Date((contact as any).lead_received_at || contact.created_at), 'dd MMM yy')}
</span>
```

**Después (editable):**
```tsx
<EditableDateCell
  value={(contact as any).lead_received_at || contact.created_at}
  onSave={handleDateUpdate}
  displayFormat="dd MMM yy"
/>
```

Añadir handler:
```typescript
const handleDateUpdate = useCallback(
  async (value: string) => {
    await onUpdateField(contact.id, contact.origin, 'lead_received_at', value);
  },
  [contact.id, contact.origin, onUpdateField]
);
```

### Fase 5: Actualizar useInlineUpdate para fecha

Añadir mapping de `lead_received_at` en `useContactInlineUpdate`:

```typescript
const fieldMap: Record<string, Record<string, string>> = {
  'company_valuations': {
    // ... existing mappings
    'lead_received_at': 'lead_received_at',
  },
  'contact_leads': {
    'lead_received_at': 'lead_received_at',
  },
  // ... para todas las tablas
};
```

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/migrations/XXX_add_lead_received_at_all_tables.sql` | Crear | Migración para añadir columna a todas las tablas |
| `supabase/functions/bulk-update-contacts/index.ts` | Modificar | Añadir lista de tablas con `lead_received_at` |
| `src/components/admin/shared/EditableDateCell.tsx` | Crear | Componente de edición de fecha inline |
| `src/components/admin/contacts/ContactTableRow.tsx` | Modificar | Reemplazar span por EditableDateCell |
| `src/hooks/useInlineUpdate.ts` | Modificar | Añadir mapping para `lead_received_at` |

---

## Flujo Final

### Edición Masiva (Bulk)
```text
Usuario selecciona N leads → Elige fecha → Click "Aplicar"
                                    ↓
                      BulkDateSelect invoca useBulkUpdateReceivedDate
                                    ↓
                      Edge Function bulk-update-contacts
                                    ↓
                 ┌──────────────────┼──────────────────┐
                 ↓                  ↓                  ↓
          contact_leads    company_valuations    advisor_valuations
               ✅                  ✅                  ✅
                 └──────────────────┼──────────────────┘
                                    ↓
                      Respuesta: "N contactos actualizados"
                                    ↓
                         Toast + UI actualizada
```

### Edición Individual (Por Fila)
```text
Click en fecha de fila → Popover con Calendar
                              ↓
                 Selecciona nueva fecha
                              ↓
            EditableDateCell llama onSave(ISOString)
                              ↓
           useContactInlineUpdate.update()
                              ↓
         SDK directo a tabla correspondiente
                              ↓
         Toast "Guardado" + UI actualizada
```

---

## Pruebas Requeridas

| Test | Descripción | Resultado Esperado |
|------|-------------|-------------------|
| 1 | Bulk: Seleccionar 5 valoraciones + 5 contactos → Aplicar fecha | 10 actualizados sin error |
| 2 | Bulk: Fecha pasada (sábado) | OK, permite backfill |
| 3 | Individual: Click en fecha de lead tipo "valuation" | Abre datepicker, guarda OK |
| 4 | Individual: Click en fecha de lead tipo "contact" | Abre datepicker, guarda OK |
| 5 | Tab "Favoritos" → Bulk update | Funciona igual que "Todos" |
| 6 | Refresh página | Fechas persisten |
| 7 | Error de red | Rollback visual + toast de error |

---

## Consideraciones Técnicas

### Performance
- No añadir queries adicionales; solo actualizar la columna existente
- Índices creados para ordenación por fecha de registro
- Mismo patrón de optimistic UI que otros campos editables

### Compatibilidad
- El fallback `lead_received_at || created_at` se mantiene para retrocompatibilidad
- Tablas existentes se migran con `created_at` como valor inicial
- Nuevos registros usan `DEFAULT now()`

### Seguridad
- La Edge Function ya usa `service_role` para bypass de RLS
- Las updates individuales respetan RLS existente (políticas de admin ya creadas)
