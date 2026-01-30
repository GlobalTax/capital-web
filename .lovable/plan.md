
# Plan: Estabilización Final de Edición Inline en Tabla de Contactos

## Estado Actual del Sistema

### ✅ Arquitectura Correcta Confirmada

El sistema de edición inline ya tiene una arquitectura robusta:

| Componente | Estado | Análisis |
|------------|--------|----------|
| **IDs en Favoritos** | ✅ Correcto | `LinearContactsManager` filtra `contacts.filter(c => favoriteIds.has(c.id))` usando el `contact.id` real, no IDs de la tabla de join |
| **Hook centralizado** | ✅ Correcto | `useContactInlineUpdate` maneja todas las actualizaciones con validación de capacidades por tabla |
| **Validación de Estados** | ✅ Implementado | El hook verifica que `status_key` existe en `contact_statuses` antes de guardar |
| **Error handling UI** | ✅ Implementado | `EditableSelect` y `EditableDateCell` muestran errores reales vía toast |
| **Cache de estados** | ✅ Mejorado | `staleTime` reducido a 30s, `refetchOnWindowFocus: true` añadido |
| **Invalidación al cerrar editor** | ✅ Implementado | `StatusesEditor` invalida cache al cerrar el panel |

### Campos Editables Actuales

| Campo | Componente | Handler en ContactTableRow |
|-------|------------|---------------------------|
| Estado (`lead_status_crm`) | `EditableSelect` | `handleStatusUpdate` (línea 150) |
| Canal (`acquisition_channel_id`) | `EditableSelect` | `handleChannelUpdate` (línea 130) |
| Fecha Registro (`lead_received_at`) | `EditableDateCell` | `handleDateUpdate` (línea 156) |
| Empresa (`company`) | `EditableCell` | `handleCompanyUpdate` (línea 135) |
| Sector (`industry`) | `EditableCell` | `handleIndustryUpdate` (línea 140) |
| Provincia (`location`) | `EditableCell` | `handleLocationUpdate` (línea 145) |

### Flujo de Datos Verificado

```text
ContactTableRow.handleStatusUpdate(value)
         ↓
onUpdateField(contact.id, contact.origin, 'lead_status_crm', value)
         ↓
LinearContactsTable.handleUpdateField (línea 225)
         ↓
useContactInlineUpdate.update(contactId, origin, field, value)
         ↓
┌─────────────────────────────────────────────────┐
│ 1. Validar tabla existe en tableMap            │
│ 2. Obtener tableCapabilities[table]            │
│ 3. Validar campo soportado por tabla           │
│ 4. [Si status] Verificar status_key existe     │
│ 5. Construir payload dinámico                  │
│ 6. Optimistic update en cache                  │
│ 7. PATCH a tabla correcta                      │
│ 8. Toast success/error + rollback si falla     │
└─────────────────────────────────────────────────┘
```

---

## Posibles Puntos de Fricción Residuales

### 1. Formulario (Lead Form) - **NO editable actualmente**
El campo `lead_form` se muestra debajo del canal pero **no es editable inline**. Solo aparece como texto:
```tsx
// ContactTableRow.tsx línea 252-256
{contact.lead_form_name && (
  <span className="text-[9px] text-muted-foreground/70 truncate mt-0.5">
    {contact.lead_form_name}
  </span>
)}
```

### 2. Race Conditions
No hay protección explícita contra doble-click rápido en `EditableSelect`.

### 3. Toast duplicado en error
Si `onSave` lanza error, tanto `useContactInlineUpdate` como `EditableSelect` muestran toast.

---

## Cambios Propuestos

### Fase 1: Añadir Lead Form Editable (Campo Formulario)

**Archivo**: `src/components/admin/contacts/ContactTableRow.tsx`

Añadir nuevo handler y componente editable para el campo Lead Form:

```typescript
// Nuevo handler (después de handleChannelUpdate)
const handleLeadFormUpdate = useCallback(
  (value: string | null) => onUpdateField(contact.id, contact.origin, 'lead_form', value),
  [contact.id, contact.origin, onUpdateField]
);

// En la celda de Canal, reemplazar el span por EditableSelect para lead_form
<EditableSelect
  value={contact.lead_form ?? undefined}
  options={leadFormOptions}  // Necesita nuevo prop
  placeholder="—"
  emptyText="—"
  allowClear
  onSave={handleLeadFormUpdate}
/>
```

Esto requiere también actualizar `LinearContactsTable` para pasar las opciones de Lead Forms.

### Fase 2: Prevenir Race Conditions

**Archivo**: `src/components/admin/shared/EditableSelect.tsx`

Añadir ref de debounce para prevenir doble-click:

```typescript
const lastSaveTimeRef = useRef<number>(0);

const handleValueChange = useCallback(async (newValue: string) => {
  const now = Date.now();
  // Prevenir saves muy rápidos (debounce 500ms)
  if (now - lastSaveTimeRef.current < 500) {
    console.log('[EditableSelect] Debounce: save ignored');
    return;
  }
  lastSaveTimeRef.current = now;
  
  // ... resto del código
}, [value, onSave]);
```

### Fase 3: Eliminar Toast Duplicado

**Archivo**: `src/hooks/useInlineUpdate.ts`

El hook ya muestra toast en error. Para evitar duplicación, `EditableSelect` no debería mostrar toast propio. Sin embargo, el enfoque actual es correcto: el hook muestra el toast porque tiene la información completa del error.

La solución es que `EditableSelect` NO muestre toast propio, ya que `onSave` (que viene de `useContactInlineUpdate`) ya lo hace.

**Archivo**: `src/components/admin/shared/EditableSelect.tsx` (líneas 77-79)

Eliminar el toast duplicado:

```typescript
// ANTES
} catch (error) {
  console.error('Error saving select:', error);
  setSaveStatus('error');
  
  // Show real error message to user
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  toast.error('Error al guardar', { description: errorMessage });  // ← ELIMINAR
  
  setTimeout(() => setSaveStatus('idle'), 2000);
}

// DESPUÉS
} catch (error) {
  console.error('Error saving select:', error);
  setSaveStatus('error');
  // Toast ya se muestra en useContactInlineUpdate
  setTimeout(() => setSaveStatus('idle'), 2000);
}
```

Lo mismo para `EditableDateCell.tsx` y `EditableCell.tsx`.

### Fase 4: Añadir Lead Form Options a LinearContactsTable

**Archivo**: `src/components/admin/contacts/LinearContactsTable.tsx`

```typescript
// Importar hook de lead forms
import { useLeadForms } from '@/hooks/useLeadForms';

// Dentro del componente
const { leadForms } = useLeadForms();

// Memoizar opciones
const leadFormOptions = useMemo<SelectOption[]>(() => 
  leadForms.map(lf => ({
    value: lf.id,
    label: lf.name,
    color: '#6b7280',
  })), [leadForms]
);

// Pasar a ContactTableRow
<ContactTableRow
  ...
  leadFormOptions={leadFormOptions}
/>
```

### Fase 5: Actualizar Props de ContactTableRow

**Archivo**: `src/components/admin/contacts/ContactTableRow.tsx`

```typescript
export interface ContactRowProps {
  // ... existing props
  leadFormOptions: SelectOption[];  // Añadir
}
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/contacts/ContactTableRow.tsx` | Añadir `handleLeadFormUpdate`, nuevo `EditableSelect` para lead_form, añadir prop `leadFormOptions` |
| `src/components/admin/contacts/LinearContactsTable.tsx` | Importar `useLeadForms`, crear `leadFormOptions`, pasarlo a `ContactTableRow` |
| `src/components/admin/shared/EditableSelect.tsx` | Añadir debounce ref, eliminar toast duplicado |
| `src/components/admin/shared/EditableDateCell.tsx` | Eliminar toast duplicado (ya se muestra en hook) |
| `src/components/admin/shared/EditableCell.tsx` | Eliminar toast duplicado (si existe) |
| `src/hooks/useInlineUpdate.ts` | Añadir mapping para `lead_form` en `fieldMap` |

---

## Pruebas de Validación

### Tab "Todos"
| Test | Campo | Resultado Esperado |
|------|-------|-------------------|
| 1 | Estado (valuation) | ✅ Guarda, persiste |
| 2 | Estado (contact) | ✅ Guarda, persiste |
| 3 | Canal | ✅ Guarda, persiste |
| 4 | Formulario (Lead Form) | ✅ **NUEVO** - Guarda, persiste |
| 5 | Fecha registro | ✅ Guarda, persiste |
| 6 | Empresa | ✅ Guarda, persiste |
| 7 | Sector | ✅ Guarda, persiste |
| 8 | Provincia | ✅ Guarda, persiste |

### Tab "Favoritos"
| Test | Campo | Resultado Esperado |
|------|-------|-------------------|
| 1 | Todos los campos | ✅ Usan `contact.id` correcto (ya verificado en código) |
| 2 | Doble-click rápido | ✅ **NUEVO** - Debounce previene duplicados |

### Robustez
| Test | Resultado Esperado |
|------|-------------------|
| Error forzado (offline) | ✅ Rollback + UN solo toast (no duplicado) |
| 5 ediciones rápidas | ✅ Debounce previene race conditions |

---

## Resumen Ejecutivo

El sistema actual ya está **muy bien implementado**. Los cambios propuestos son mejoras incrementales:

1. **Lead Form editable** - Campo que falta por hacer editable inline
2. **Debounce anti-race** - Prevención de doble-click
3. **Toast deduplicación** - Evitar mensajes duplicados

El núcleo del sistema (IDs correctos, validación de estados, tabla de capacidades, optimistic UI) ya funciona correctamente tanto en "Todos" como en "Favoritos".
