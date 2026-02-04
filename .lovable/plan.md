
# Plan: Recuperar Selección Masiva de Formulario + Auto-Update en Pipeline

## Diagnóstico Completado

### Problema A: Selección Masiva para Formulario
**Causa raíz identificada**: El componente `BulkLeadFormSelect` existe y funciona correctamente, pero **no está importado** en `ContactsHeader.tsx`. Las otras acciones masivas (Estado, Canal, Archivar, Sync) sí están incluidas.

| Componente | Estado |
|------------|--------|
| `BulkStatusSelect` | ✅ Importado y funcionando |
| `BulkChannelSelect` | ✅ Importado y funcionando |
| `BulkLeadFormSelect` | ❌ **NO importado** (existe en `/contacts/BulkLeadFormSelect.tsx`) |

### Problema B: Pipeline Drag & Drop sin Auto-Update
**Causa raíz identificada**: El hook `useContactInlineUpdate` actualiza correctamente el estado vía `supabase.update()` con optimistic UI, pero:
1. La invalidación de cache usa `refetchType: 'none'` (no refetch inmediato)
2. El hook `useContacts` de contacts-v2 usa su propio fetch y Realtime (escucha `contact_leads` y `company_valuations`)
3. **El canal Realtime ya está configurado** y debería funcionar

El Realtime está bien configurado. El issue puede ser que tras el drag, la UI local se actualiza pero si el usuario cambia de pestaña, el estado puede no estar sincronizado hasta el próximo refetch.

---

## Implementación

### 1. Añadir BulkLeadFormSelect al Header

**Archivo**: `src/components/admin/contacts-v2/ContactsHeader.tsx`

Cambios mínimos:
- Importar `BulkLeadFormSelect` desde `../contacts/BulkLeadFormSelect`
- Añadirlo en el bloque de bulk actions junto a los otros selectores

```typescript
// Añadir import
import { BulkLeadFormSelect } from '../contacts/BulkLeadFormSelect';

// En el JSX, después de BulkChannelSelect:
<BulkLeadFormSelect
  selectedIds={selectedIds}
  contacts={contacts as any}
  onSuccess={onClearSelection}
/>
```

### 2. Mejorar Invalidación de Cache tras Drag & Drop

**Archivo**: `src/hooks/useInlineUpdate.ts`

Cambio en la función `update` del hook `useContactInlineUpdate`:
- Cambiar `refetchType: 'none'` a `refetchType: 'active'` para que refetche las queries activas
- Añadir invalidación del hook local de contacts-v2

```typescript
// Línea ~425-428: Cambiar invalidación
queryClient.invalidateQueries({
  queryKey: ['unified-contacts'],
  refetchType: 'active', // Cambiado de 'none' a 'active'
});

// Añadir invalidación de contacts-v2 para sincronía
queryClient.invalidateQueries({ 
  queryKey: ['contacts-v2'],
  refetchType: 'active'
});
```

### 3. Mejorar Invalidación en BulkUpdateLeadForm

**Archivo**: `src/hooks/useBulkUpdateLeadForm.ts`

Asegurar que tras bulk update de formulario, se invalide correctamente:

```typescript
// Línea ~79-84: Cambiar invalidación
onSuccess: (data) => {
  queryClient.invalidateQueries({
    queryKey: ['unified-contacts'],
    refetchType: 'active', // Cambiado de 'none'
  });
  
  // Añadir para contacts-v2
  queryClient.invalidateQueries({ 
    queryKey: ['contacts-v2'],
    refetchType: 'active'
  });
  
  // ... resto del toast
}
```

---

## Archivos a Modificar

| Archivo | Cambio | Líneas Afectadas |
|---------|--------|------------------|
| `src/components/admin/contacts-v2/ContactsHeader.tsx` | Importar y añadir `BulkLeadFormSelect` | +2 líneas import, +5 líneas JSX |
| `src/hooks/useInlineUpdate.ts` | Cambiar `refetchType` + añadir invalidación contacts-v2 | ~3 líneas |
| `src/hooks/useBulkUpdateLeadForm.ts` | Cambiar `refetchType` + añadir invalidación contacts-v2 | ~3 líneas |

---

## Flujo Resultante

### Selección Masiva de Formulario

```text
┌─────────────────────────────────────────────────────────────┐
│                    BULK ACTIONS TOOLBAR                      │
├─────────────────────────────────────────────────────────────┤
│  [Archivar (3)] [Estado ▼] [Canal ▼] [Formulario ▼] [Brevo] │
│                                          ▲                   │
│                                   NUEVO (restaurado)         │
└─────────────────────────────────────────────────────────────┘

Flujo:
1. Usuario selecciona N leads (checkboxes)
2. Aparece toolbar de bulk actions
3. Usuario elige "Formulario" → dropdown con formularios disponibles
4. Click "Aplicar" → diálogo de confirmación
5. Confirmar → bulk-update-contacts edge function
6. Optimistic update + invalidación de cache
7. Toast de éxito, limpiar selección
```

### Pipeline Drag & Drop

```text
┌─────────────────────────────────────────────────────────────┐
│   [Nuevo]          [Contactando]        [Calificado]        │
│  ┌──────────┐      ┌──────────┐        ┌──────────┐         │
│  │ Lead A   │ ───▶ │          │        │          │         │
│  └──────────┘  D&D └──────────┘        └──────────┘         │
│                                                              │
│  1. onDragEnd detecta nuevo droppableId                     │
│  2. useContactInlineUpdate.update()                         │
│  3. Optimistic UI (movimiento inmediato)                    │
│  4. Supabase update lead_status_crm                         │
│  5. invalidateQueries(['unified-contacts'], 'active')       │
│  6. invalidateQueries(['contacts-v2'], 'active')            │
│  7. Realtime propaga a otras pestañas/vistas               │
└─────────────────────────────────────────────────────────────┘
```

---

## Verificación Rápida

### Test 1: Bulk Form Update
1. Ir a `/admin/contacts`
2. Seleccionar 3+ leads con checkboxes
3. Verificar que aparece dropdown "Formulario"
4. Seleccionar un formulario y click "Aplicar"
5. Confirmar en diálogo
6. Verificar toast de éxito
7. Verificar que la columna "Formulario" (si existe) muestra el nuevo valor

### Test 2: Pipeline Drag & Drop
1. Ir a `/admin/contacts` → Tab "Pipeline"
2. Arrastrar un lead de "Nuevo" a "Contactando"
3. Verificar movimiento inmediato (optimistic)
4. Cambiar a tab "Todos"
5. Verificar que el lead muestra nuevo estado SIN refresh manual

---

## Resumen Técnico

| Elemento | Acción |
|----------|--------|
| `BulkLeadFormSelect` | **Importar** en `ContactsHeader.tsx` |
| `useContactInlineUpdate` | Cambiar `refetchType: 'active'` + invalidar `contacts-v2` |
| `useBulkUpdateLeadForm` | Cambiar `refetchType: 'active'` + invalidar `contacts-v2` |
| Edge function | Sin cambios (ya funciona correctamente) |
| Realtime | Sin cambios (ya configurado) |

**Total de cambios**: ~15 líneas de código en 3 archivos
