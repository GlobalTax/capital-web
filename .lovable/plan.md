
# Plan: Completar Sistema de Estados Configurables para Contactos

## Resumen del Análisis

Tras revisar el código en profundidad, he encontrado que ya existe una implementación parcial del sistema de estados configurables:

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| Tabla `contact_statuses` | ✅ Completa | BD Supabase |
| Hook `useContactStatuses` | ✅ Completo | `src/hooks/useContactStatuses.ts` |
| UI de gestión `StatusesEditor` | ✅ Completo | `src/components/admin/contacts/StatusesEditor.tsx` |
| Modal crear/editar `StatusEditModal` | ✅ Completo | `src/components/admin/contacts/StatusEditModal.tsx` |
| Selector en tabla `ContactTableRow` | ❌ **HARDCODEADO** | Usa `STATUS_OPTIONS` estático |
| Selector en ficha `ContactDetailSheet` | ❌ **NO EXISTE** | Falta integrar |

---

## Problema Principal Detectado

En `ContactTableRow.tsx` (líneas 41-51), los estados están **hardcodeados**:

```typescript
// PROBLEMA: Opciones estáticas, NO usa contact_statuses
export const STATUS_OPTIONS: SelectOption[] = [
  { value: 'nuevo', label: 'Nuevo', color: '#6b7280' },
  { value: 'contactado', label: 'Contactado', color: '#3b82f6' },
  // ... etc
];
```

Esto significa que:
- Si añades un estado nuevo desde el panel, NO aparece en la tabla
- Si cambias el label o color de un estado, NO se refleja en la tabla
- Los cambios de estado persisten correctamente (usa `lead_status_crm`), pero el UI no es dinámico

---

## Solución Propuesta

### Fase 1: Hacer dinámico el selector de estado en la tabla

**Archivo**: `src/components/admin/contacts/LinearContactsTable.tsx`

Cambiar de pasar `STATUS_OPTIONS` estático a pasar los estados dinámicos de `useContactStatuses`:

```typescript
import { useContactStatuses, STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';

const LinearContactsTable = ({ ... }) => {
  const { activeStatuses } = useContactStatuses();
  
  // Convertir a formato SelectOption
  const statusOptions = useMemo(() => 
    activeStatuses.map(s => ({
      value: s.status_key,
      label: s.label,
      color: STATUS_COLOR_MAP[s.color]?.text || '#6b7280',
      icon: s.icon,
    })),
    [activeStatuses]
  );
  
  // Pasar statusOptions a cada row
};
```

**Archivo**: `src/components/admin/contacts/ContactTableRow.tsx`

- Eliminar el export de `STATUS_OPTIONS` hardcodeado
- Recibir `statusOptions` como prop
- Añadir lógica para mostrar "(Inactivo)" si el estado actual está desactivado

---

### Fase 2: Añadir selector de estado a ContactDetailSheet

**Archivo**: `src/components/admin/contacts/ContactDetailSheet.tsx`

Añadir el componente `LeadStatusSelect` (ya existe y funciona correctamente):

```typescript
import { LeadStatusSelect } from '@/components/admin/leads/LeadStatusSelect';

// En la sección de "Estado del seguimiento"
<LeadStatusSelect
  leadId={contact.id}
  leadType={contact.origin}
  currentStatus={contact.lead_status_crm || 'nuevo'}
  onStatusChange={() => queryClient.invalidateQueries(['unified-contacts'])}
/>
```

---

### Fase 3: Validaciones de integridad

1. **No permitir eliminar estados en uso**: Añadir validación en `useContactStatuses.deleteStatus`
2. **Mostrar "(Inactivo)" en contactos con estado desactivado**: Ya implementado en `LeadStatusSelect`, falta en tabla
3. **Fallback a "Nuevo"**: Si un contacto no tiene estado, mostrar "Nuevo" por defecto

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/contacts/LinearContactsTable.tsx` | Usar `useContactStatuses` para generar opciones dinámicas |
| `src/components/admin/contacts/ContactTableRow.tsx` | Eliminar `STATUS_OPTIONS` hardcodeado, recibir como prop |
| `src/components/admin/contacts/ContactDetailSheet.tsx` | Añadir `LeadStatusSelect` para cambiar estado desde ficha |
| `src/hooks/useContactStatuses.ts` | Añadir validación antes de eliminar |

---

## Diagrama de Flujo Actual vs Propuesto

**Actual (problemático)**:
```
StatusesEditor → contact_statuses (BD)
                       ↓
                   (desconectado)
                       ↓
ContactTableRow → STATUS_OPTIONS (hardcodeado) → UI estático
```

**Propuesto (correcto)**:
```
StatusesEditor → contact_statuses (BD) ← useContactStatuses
                                              ↓
                                       activeStatuses
                                              ↓
ContactTableRow → statusOptions (dinámico) → UI reactivo
```

---

## Sección Técnica

### 1. Cambios en LinearContactsTable.tsx

```typescript
// Añadir import
import { useContactStatuses, STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';

// Dentro del componente
const { activeStatuses, statuses } = useContactStatuses();

// Generar opciones dinámicas
const statusOptions = useMemo(() => 
  activeStatuses.map(s => ({
    value: s.status_key,
    label: s.label,
    color: STATUS_COLOR_MAP[s.color]?.text?.replace('text-', '') || '#6b7280',
    icon: s.icon,
  })),
  [activeStatuses]
);

// Pasar a ContactTableRow
<ContactTableRow
  {...props}
  statusOptions={statusOptions}
  allStatuses={statuses} // Para detectar estados inactivos
/>
```

### 2. Cambios en ContactTableRow.tsx

```typescript
// Eliminar estas líneas (41-51)
// export const STATUS_OPTIONS: SelectOption[] = [...]

// Añadir props
interface ContactRowProps {
  // ... existentes
  statusOptions: SelectOption[];
  allStatuses?: ContactStatus[]; // Para detectar inactivos
}

// En el render del selector
<EditableSelect
  value={contact.lead_status_crm ?? undefined}
  options={statusOptions}
  placeholder="—"
  emptyText="—"
  allowClear
  onSave={handleStatusUpdate}
  // Mostrar "(Inactivo)" si el estado actual no está en activeStatuses
  renderValue={(val) => {
    const inActive = statusOptions.find(o => o.value === val);
    if (!inActive && val) {
      const inactive = allStatuses?.find(s => s.status_key === val);
      return inactive ? `${inactive.label} (Inactivo)` : val;
    }
    return inActive?.label || val;
  }}
/>
```

### 3. Añadir LeadStatusSelect a ContactDetailSheet.tsx

```typescript
// Añadir import
import { LeadStatusSelect } from '@/components/admin/leads/LeadStatusSelect';

// En la sección "Estado del seguimiento" (línea ~573)
<div className="space-y-1 mb-6">
  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
    Estado del lead
  </h3>
  <LeadStatusSelect
    leadId={contact.id}
    leadType={contact.origin}
    currentStatus={contact.lead_status_crm || 'nuevo'}
    onStatusChange={() => {
      queryClient.invalidateQueries({ queryKey: ['unified-contacts'] });
    }}
  />
</div>
```

### 4. Validación antes de eliminar en useContactStatuses.ts

```typescript
// En deleteStatusMutation.mutationFn
const deleteStatusMutation = useMutation({
  mutationFn: async (id: string) => {
    const status = statuses.find(s => s.id === id);
    if (status?.is_system) {
      throw new Error('No se puede eliminar un estado del sistema');
    }
    
    // NUEVO: Verificar si hay contactos usando este estado
    const { count, error: countError } = await supabase
      .from('contact_leads')
      .select('id', { count: 'exact', head: true })
      .eq('lead_status_crm', status?.status_key);
    
    if (countError) throw countError;
    if (count && count > 0) {
      throw new Error(`No se puede eliminar: ${count} contactos usan este estado`);
    }
    
    // Proceder con la eliminación
    const { error } = await supabase
      .from('contact_statuses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  // ...
});
```

---

## Pruebas Requeridas

1. Crear un estado nuevo desde StatusesEditor y verificar que aparece en la tabla
2. Editar label/color/orden de un estado y verificar que se refleja en la tabla
3. Desactivar un estado usado por un contacto y verificar que se muestra como "(Inactivo)"
4. Cambiar el estado de un contacto desde la tabla (inline) y desde la ficha de detalle
5. Verificar que los filtros por estado siguen funcionando
6. Intentar eliminar un estado en uso y verificar que se muestra error

---

## Impacto

| Métrica | Valor |
|---------|-------|
| Archivos modificados | 4 |
| Líneas añadidas | ~50 |
| Líneas eliminadas | ~15 (STATUS_OPTIONS hardcodeado) |
| Riesgo | Bajo (cambios compatibles con fallback) |
| Tiempo estimado | 30 minutos |

---

## Compatibilidad y Migración

No se requiere migración de datos porque:
- El campo `lead_status_crm` ya almacena el `status_key` (no el label)
- La tabla `contact_statuses` ya contiene todos los estados existentes
- Los contactos existentes ya tienen valores válidos en `lead_status_crm`

El sistema es 100% retrocompatible.
