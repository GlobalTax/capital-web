
# Plan: Tabla de Contactos 100% Editable Inline Sin Errores

## Diagnóstico Completado

### Problemas Identificados

#### 1. Bug Crítico: `updated_at` en `company_valuations`
**Archivo**: `src/hooks/useInlineUpdate.ts` (línea 244)  
**Problema**: El hook siempre añade `updated_at` al payload de actualización, pero la tabla `company_valuations` NO tiene esta columna.  
**Impacto**: Cualquier edición inline en leads de tipo "valuation" falla con error SQL.

#### 2. Columna `lead_received_at` faltante en `acquisition_leads`
**Problema**: La tabla `acquisition_leads` no tiene la columna `lead_received_at`.  
**Impacto**: Cambios de "Fecha de registro" fallan para leads de adquisición.

#### 3. Columna `lead_status_crm` faltante en múltiples tablas
**Situación actual**:
- ✅ `company_valuations`, `contact_leads`, `collaborator_applications` - tienen `lead_status_crm`
- ❌ `acquisition_leads`, `advisor_valuations`, `buyer_contacts`, `company_acquisition_inquiries`, `general_contact_leads` - NO tienen

**Impacto**: Cambios de "Estado" fallan para ~5 tipos de leads.

#### 4. Inconsistencia en Edge Function `bulk-update-contacts`
El array `tablesWithStatusCrm` lista tablas que en realidad NO tienen la columna, causando errores silenciosos en actualizaciones masivas.

#### 5. Error handling insuficiente
Los componentes editables (`EditableSelect`, `EditableCell`, `EditableDateCell`) no muestran el error real al usuario, solo un mensaje genérico.

---

## Solución: Arquitectura Robusta de Edición Inline

### Fase 1: Migración de Base de Datos

```sql
-- 1. Añadir updated_at a company_valuations
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Añadir lead_received_at a acquisition_leads
ALTER TABLE public.acquisition_leads 
ADD COLUMN IF NOT EXISTS lead_received_at TIMESTAMPTZ DEFAULT now();

UPDATE public.acquisition_leads 
SET lead_received_at = created_at 
WHERE lead_received_at IS NULL;

-- 3. Añadir lead_status_crm a tablas faltantes (con tipo TEXT para evitar problemas de enum)
-- NOTA: Usar TEXT en vez de enum permite mayor flexibilidad
ALTER TABLE public.acquisition_leads 
ADD COLUMN IF NOT EXISTS lead_status_crm TEXT DEFAULT 'nuevo';

ALTER TABLE public.advisor_valuations 
ADD COLUMN IF NOT EXISTS lead_status_crm TEXT DEFAULT 'nuevo';

ALTER TABLE public.general_contact_leads 
ADD COLUMN IF NOT EXISTS lead_status_crm TEXT DEFAULT 'nuevo';

ALTER TABLE public.company_acquisition_inquiries 
ADD COLUMN IF NOT EXISTS lead_status_crm TEXT DEFAULT 'nuevo';

-- buyer_contacts es especial (compradores no leads) - no añadir lead_status_crm
```

### Fase 2: Actualizar `useContactInlineUpdate` (Arquitectura Centralizada)

**Archivo**: `src/hooks/useInlineUpdate.ts`

Cambios necesarios:

1. **Crear mapa de columnas por tabla** para saber qué columnas soporta cada tabla
2. **Condicionar `updated_at`** según la tabla
3. **Validar campo antes de enviar** - si la tabla no soporta el campo, retornar error claro
4. **Mejorar error handling** con mensaje real del backend
5. **Añadir logging en dev** para debugging

```typescript
// Ejemplo de estructura mejorada
const tableCapabilities: Record<string, {
  hasUpdatedAt: boolean;
  hasLeadReceivedAt: boolean;
  hasLeadStatusCrm: boolean;
  hasAcquisitionChannel: boolean;
}> = {
  'company_valuations': {
    hasUpdatedAt: true, // Después de la migración
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: true,
    hasAcquisitionChannel: true,
  },
  'acquisition_leads': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true, // Después de la migración
    hasLeadStatusCrm: true, // Después de la migración
    hasAcquisitionChannel: true,
  },
  // ... resto de tablas
};

const update = async (id, origin, field, value) => {
  const table = tableMap[origin];
  const capabilities = tableCapabilities[table];
  
  // Validar que el campo existe en la tabla
  if (field === 'lead_status_crm' && !capabilities.hasLeadStatusCrm) {
    toast.error(`Este tipo de lead no soporta cambio de estado`);
    return { success: false };
  }
  
  // Construir payload dinámicamente
  const payload: Record<string, any> = { [mappedField]: value };
  if (capabilities.hasUpdatedAt) {
    payload.updated_at = new Date().toISOString();
  }
  
  // ... resto de la lógica
};
```

### Fase 3: Actualizar Edge Function `bulk-update-contacts`

**Archivo**: `supabase/functions/bulk-update-contacts/index.ts`

Sincronizar los arrays de tablas con la realidad del schema (después de la migración):

```typescript
// Después de la migración, actualizar a:
const tablesWithStatusCrm = [
  'contact_leads',
  'company_valuations',
  'collaborator_applications',
  'acquisition_leads',
  'advisor_valuations',
  'general_contact_leads',
  'company_acquisition_inquiries',
  // buyer_contacts excluido intencionalmente
];
```

### Fase 4: Mejorar Error Handling en Componentes UI

**Archivos**:
- `src/components/admin/shared/EditableSelect.tsx`
- `src/components/admin/shared/EditableCell.tsx`
- `src/components/admin/shared/EditableDateCell.tsx`

Cambios:
1. Propagar el mensaje de error real desde `onSave` 
2. Mostrar toast con descripción del error
3. Asegurar rollback visual correcto

```typescript
// En handleValueChange de EditableSelect:
try {
  await onSave(actualValue);
  setSaveStatus('success');
} catch (error) {
  console.error('Error saving select:', error);
  setSaveStatus('error');
  // Mostrar error real en lugar de genérico
  toast.error('Error al guardar', {
    description: error instanceof Error ? error.message : 'Error desconocido'
  });
}
```

### Fase 5: Actualizar `useUnifiedContacts` para leer nuevas columnas

**Archivo**: `src/hooks/useUnifiedContacts.tsx`

Asegurar que las queries de cada tabla incluyen:
- `lead_received_at` (para `acquisition_leads`)
- `lead_status_crm` (para las nuevas tablas)

---

## Archivos a Modificar

| Archivo | Tipo | Cambios |
|---------|------|---------|
| `supabase/migrations/XXX_fix_inline_edit_columns.sql` | Nuevo | Añadir columnas faltantes |
| `src/hooks/useInlineUpdate.ts` | Modificar | Validación de campos + updated_at condicional |
| `supabase/functions/bulk-update-contacts/index.ts` | Modificar | Actualizar arrays de tablas |
| `src/components/admin/shared/EditableSelect.tsx` | Modificar | Error handling mejorado |
| `src/components/admin/shared/EditableCell.tsx` | Modificar | Error handling mejorado |
| `src/components/admin/shared/EditableDateCell.tsx` | Modificar | Error handling mejorado |
| `src/hooks/useUnifiedContacts.tsx` | Modificar | Incluir nuevas columnas en queries |

---

## Flujo de Edición Inline (Post-Fix)

```text
Usuario hace click en celda editable
           ↓
   Componente abre editor
           ↓
   Usuario selecciona/escribe nuevo valor
           ↓
   handleSave() llamado
           ↓
   useContactInlineUpdate.update()
           ↓
   ┌─────────────────────────────────────┐
   │ 1. Validar campo existe en tabla   │
   │ 2. Mapear nombre de campo          │
   │ 3. Construir payload (con/sin      │
   │    updated_at según tabla)         │
   │ 4. Optimistic update en cache      │
   │ 5. Ejecutar UPDATE via SDK         │
   └──────────────┬──────────────────────┘
                  ↓
        ┌────────┴────────┐
        ↓ ÉXITO           ↓ ERROR
   Toast "Guardado"    Rollback cache
   Invalidar query     Toast con error real
```

---

## Suite de Pruebas

### Tab "Todos"
| Test | Campo | Resultado Esperado |
|------|-------|-------------------|
| 1 | Estado (valuation) | ✅ Guarda, persiste |
| 2 | Estado (contact) | ✅ Guarda, persiste |
| 3 | Estado (acquisition) | ✅ Guarda, persiste (nueva columna) |
| 4 | Canal | ✅ Guarda, persiste |
| 5 | Fecha registro | ✅ Guarda, persiste |
| 6 | Empresa (texto) | ✅ Guarda, persiste |
| 7 | Sector | ✅ Guarda, persiste |
| 8 | Provincia | ✅ Guarda, persiste |

### Tab "Favoritos"
| Test | Campo | Resultado Esperado |
|------|-------|-------------------|
| 1 | Estado | ✅ Guarda usando contact.id correcto |
| 2 | Canal | ✅ Funciona igual que en "Todos" |
| 3 | Fecha registro | ✅ Funciona igual que en "Todos" |

### Pruebas de Estrés
| Test | Resultado Esperado |
|------|-------------------|
| Editar 5 filas seguidas | No crash, todas guardan |
| Doble click | No duplica, no corrompe |
| Error forzado (offline) | UI revierte, muestra error claro |

---

## Consideraciones Técnicas

### Performance
- Optimistic UI mantiene la sensación de velocidad
- Invalidación selectiva (no refetch global)
- Memoización existente es correcta

### Compatibilidad "Todos" vs "Favoritos"
- **Confirmado**: Ambos tabs usan el mismo `contact.id` real
- **Confirmado**: No hay confusión con `favorites.id`
- La lista de favoritos es solo un filtro cliente-side

### Seguridad (RLS)
- **Confirmado**: Políticas de UPDATE para admins existen en todas las tablas
- La función `current_user_is_admin()` verifica el rol correctamente
- No se requieren cambios en RLS

---

## Orden de Implementación

1. **Primero**: Migración SQL (añadir columnas)
2. **Segundo**: Actualizar `useInlineUpdate.ts` (validación + updated_at condicional)
3. **Tercero**: Actualizar Edge Function (arrays correctos)
4. **Cuarto**: Mejorar error handling en componentes UI
5. **Quinto**: Actualizar queries en `useUnifiedContacts.tsx`
6. **Último**: Pruebas en ambos tabs
