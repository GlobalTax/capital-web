
# Plan: Fecha de Registro Editable para Campaña API + Navegador

## Resumen Ejecutivo

Implementar la funcionalidad de "Fecha de registro" (`lead_received_at`) editable en masa para los leads de la campaña "API + Navegador", replicando la funcionalidad existente en `/admin/contacts` pero aplicada a la tabla `buyer_contacts`.

---

## Contexto Técnico Identificado

### Estado Actual
- La tabla `buyer_contacts` gestiona los contactos de campañas tipo "Compras"
- **NO existe** el campo `lead_received_at` en `buyer_contacts`
- El sistema de `/admin/contacts` ya tiene:
  - Campo `lead_received_at` en `contact_leads`
  - Componente `BulkDateSelect` para edición masiva
  - Edge function `bulk-update-contacts` que soporta múltiples tablas
  - Hook `useBulkUpdateReceivedDate` con optimistic updates

### Arquitectura Objetivo
Extender la infraestructura existente para soportar `buyer_contacts` con la misma UX.

---

## Cambios Planificados

### 1. Base de Datos - Migración

Añadir el campo `lead_received_at` a la tabla `buyer_contacts`:

```sql
-- Añadir campo lead_received_at
ALTER TABLE buyer_contacts 
ADD COLUMN lead_received_at TIMESTAMPTZ DEFAULT NOW();

-- Migrar datos existentes: lead_received_at = created_at
UPDATE buyer_contacts 
SET lead_received_at = created_at 
WHERE lead_received_at IS NULL;

-- Crear trigger para nuevos registros
CREATE OR REPLACE FUNCTION set_lead_received_at_buyer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_received_at IS NULL THEN
    NEW.lead_received_at := NEW.created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_lead_received_at_buyer
BEFORE INSERT ON buyer_contacts
FOR EACH ROW
EXECUTE FUNCTION set_lead_received_at_buyer();
```

---

### 2. Backend - Actualizar Edge Function

Modificar `supabase/functions/bulk-update-contacts/index.ts` para soportar `buyer_contacts`:

**Cambios:**
- Añadir `buyer_contacts` al mapa `contactsByTable`
- Añadir `buyer` al mapa `originToTable`
- Incluir `buyer_contacts` en `tablesWithUpdatedAt`

```typescript
// Añadir al mapa de tablas
const contactsByTable: Record<string, string[]> = {
  // ... tablas existentes
  buyer_contacts: [],
};

const originToTable: Record<string, string> = {
  // ... orígenes existentes
  'buyer': 'buyer_contacts',
};
```

---

### 3. Frontend - Componentes UI

#### 3.1 Actualizar Tabla de Buyer Contacts

**Archivo:** `src/components/admin/buyer-contacts/BuyerContactsTable.tsx`

Cambios:
- Añadir columna "Fecha de registro" mostrando `lead_received_at`
- Añadir checkboxes para selección múltiple
- Implementar lógica de selección (selectContact, selectAll)
- Reemplazar columna menos útil por "Fecha Alta" → "F. Registro"

```typescript
// Nueva columna en TableHeader
<TableHead>F. Registro</TableHead>

// En cada fila
<TableCell className="text-sm text-muted-foreground">
  {format(new Date(contact.lead_received_at || contact.created_at), 'dd/MM/yyyy', { locale: es })}
</TableCell>
```

#### 3.2 Crear Componente de Selección Masiva

**Nuevo archivo:** `src/components/admin/buyer-contacts/BuyerBulkDateSelect.tsx`

Reutilizar la estructura de `BulkDateSelect.tsx` adaptada para buyer_contacts:
- Date picker con calendario
- Validación: no permitir fechas futuras
- Diálogo de confirmación antes de aplicar
- Toast de éxito/error

#### 3.3 Crear Manager con Acciones Masivas

**Archivo a modificar:** Crear o actualizar el manager principal de buyer-contacts para incluir:
- Barra de acciones masivas cuando hay selección
- Botón "Cambiar fecha de registro"
- Integración con el hook de bulk update

---

### 4. Hooks

#### 4.1 Hook de Selección

**Nuevo archivo:** `src/hooks/useBuyerContactSelection.ts`

```typescript
export function useBuyerContactSelection(contacts: BuyerContact[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const selectContact = (id: string) => {...};
  const selectAll = () => {...};
  const clearSelection = () => {...};
  
  return { selectedIds, selectContact, selectAll, clearSelection };
}
```

#### 4.2 Hook de Bulk Update

**Nuevo archivo:** `src/hooks/useBulkUpdateBuyerDate.ts`

Similar a `useBulkUpdateReceivedDate` pero para buyer_contacts:
- Optimistic update en cache de React Query
- Llamada a `bulk-update-contacts` con prefix `buyer_`
- Rollback en caso de error
- Toast de feedback

---

### 5. Importación Excel - Soporte de Fecha

**Archivo:** `src/hooks/useBuyerContactImport.ts`

Modificaciones:
- Detectar columna "Fecha de registro" / "lead_received_at" / "Fecha entrada"
- Parsear fecha con formatos múltiples:
  - Excel serial date
  - DD/MM/YYYY
  - YYYY-MM-DD
- Si la columna existe y es válida → usar esa fecha
- Si no existe → usar `created_at` (momento de importación)

```typescript
// Añadir al parseExcelFile
const parseDate = (value: any): string | null => {
  if (!value) return null;
  // Formato serial de Excel
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d).toISOString();
  }
  // Formatos string
  const parsed = parseISO(value) || parse(value, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? parsed.toISOString() : null;
};

// En executeImport
const contacts = batch.map(row => ({
  // ... otros campos
  lead_received_at: parseDate(row.lead_received_at || row['Fecha de registro']) || new Date().toISOString(),
}));
```

---

### 6. Tipos TypeScript

**Archivo:** `src/types/buyer-contacts.ts`

```typescript
export interface BuyerContact {
  // ... campos existentes
  lead_received_at: string | null; // NUEVO
}

export interface ExcelRow {
  // ... campos existentes
  lead_received_at?: string; // NUEVO
  'Fecha de registro'?: string; // Alias alternativo
}
```

---

## Flujo de Usuario Final

```text
1. Usuario va a la vista de gestión de "API + Navegador"
2. Ve la tabla con columna "F. Registro" visible
3. Puede:
   a) Importar Excel con columna opcional de fecha
   b) Seleccionar múltiples leads con checkboxes
   c) Click en "Cambiar fecha de registro"
   d) Seleccionar fecha en el date picker
   e) Confirmar en el modal
4. Se actualiza la fecha de todos los seleccionados
5. Toast confirma el éxito
```

---

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/xxx.sql` | CREAR - Migración para añadir campo |
| `supabase/functions/bulk-update-contacts/index.ts` | MODIFICAR - Añadir soporte buyer_contacts |
| `src/types/buyer-contacts.ts` | MODIFICAR - Añadir lead_received_at |
| `src/hooks/useBuyerContactImport.ts` | MODIFICAR - Parsear columna fecha |
| `src/hooks/useBuyerContactSelection.ts` | CREAR - Hook de selección |
| `src/hooks/useBulkUpdateBuyerDate.ts` | CREAR - Hook de bulk update |
| `src/components/admin/buyer-contacts/BuyerContactsTable.tsx` | MODIFICAR - Columna + checkboxes |
| `src/components/admin/buyer-contacts/BuyerBulkDateSelect.tsx` | CREAR - Componente date picker masivo |
| `src/components/admin/buyer-contacts/BuyerContactsManager.tsx` | CREAR/MODIFICAR - Manager con acciones masivas |

---

## Pruebas Requeridas

1. **Importar Excel sin columna fecha** → `lead_received_at` = `created_at`
2. **Importar Excel con columna fecha** → `lead_received_at` = fecha del Excel
3. **Seleccionar múltiples leads → cambiar fecha** → persiste correctamente
4. **Ordenar/filtrar por fecha** → usa `lead_received_at`
5. **No permitir fechas futuras** → validación activa
6. **Otras campañas sin afectar** → `/admin/contacts` sigue funcionando

---

## Notas de Seguridad

- Mantener RLS policies existentes en `buyer_contacts`
- Validar que solo admins puedan editar fechas masivamente
- Edge function ya valida que la fecha no sea futura
