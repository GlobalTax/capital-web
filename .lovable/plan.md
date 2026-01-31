
# Plan: Unificar contact_statuses y lead_pipeline_columns

## Análisis Actual

### Dos Sistemas Paralelos Detectados

| Aspecto | `contact_statuses` | `lead_pipeline_columns` |
|---------|-------------------|------------------------|
| **Registros** | 16 estados | 10 columnas |
| **Campos únicos** | `is_active`, `is_prospect_stage` | `is_visible` |
| **Archivos dependientes** | 20+ archivos | 7 archivos |
| **Módulos** | CRM, Métricas, Prospectos, Filtros | Solo Leads Pipeline |
| **Hook** | `useContactStatuses` | `useLeadPipelineColumns` |
| **Editor UI** | `StatusesEditor.tsx` | `PipelineColumnsEditor.tsx` |

### Problemas de la Duplicación Actual
1. **Desincronización**: Los estados pueden diferir entre sistemas
2. **Mantenimiento doble**: Cambiar un color/label requiere actualizar 2 tablas
3. **Confusión de campos**: `is_active` vs `is_visible` (mismo concepto)
4. **Código duplicado**: Dos hooks, dos editores, lógica similar

## Estrategia de Unificación

### Decisión: `contact_statuses` como fuente única

Razones:
- Ya tiene 16 estados (más completo que los 10 de pipeline)
- Tiene campos adicionales útiles (`is_prospect_stage`)
- Es usado por más módulos (20+ vs 7 archivos)
- La nomenclatura `status` es más genérica que `column`

### Cambios en Base de Datos

#### 1. Agregar campo `is_visible` a `contact_statuses`
```sql
ALTER TABLE contact_statuses 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Sincronizar con is_active (inicialmente iguales)
UPDATE contact_statuses SET is_visible = is_active;
```

#### 2. Deprecar `lead_pipeline_columns`
- NO eliminar inmediatamente (mantener como backup)
- Marcar como deprecated en código
- Eliminar después de validación

### Cambios en Código

#### Fase 1: Extender `useContactStatuses`

Agregar funcionalidad de pipeline al hook existente:

```typescript
// useContactStatuses.ts - Agregar:
export interface ContactStatus {
  // ... campos existentes
  is_visible: boolean; // NUEVO: para compatibilidad con pipeline
}

// Nuevos métodos:
const toggleVisibility = useMutation({...}); // Para pipeline
const visibleStatuses = statuses.filter(s => s.is_visible); // Para pipeline
```

#### Fase 2: Migrar Leads Pipeline

| Archivo Actual | Cambio |
|----------------|--------|
| `useLeadPipelineColumns.ts` | Eliminar, usar `useContactStatuses` |
| `PipelineColumnsEditor.tsx` | Adaptar a usar `StatusesEditor` o unificar |
| `LeadsPipelineView.tsx` | Cambiar `useLeadPipelineColumns` → `useContactStatuses` |
| `ColumnEditModal.tsx` | Eliminar, usar `StatusEditModal` |
| `ColumnDeleteDialog.tsx` | Eliminar |

#### Fase 3: Unificar Editores

Opciones:
- **A) Un solo editor**: Fusionar `StatusesEditor` y `PipelineColumnsEditor`
- **B) Editor compartido**: Componente base con variantes por contexto

Recomendación: **Opción A** - Un solo editor en `/admin/contacts` con todas las opciones

### Mapeo de Campos

| `lead_pipeline_columns` | `contact_statuses` | Acción |
|------------------------|-------------------|--------|
| `stage_key` | `status_key` | Ya equivalentes |
| `is_visible` | `is_visible` (nuevo) | Migrar valores |
| `is_system` | `is_system` | Ya existe |
| `position` | `position` | Ya existe |

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useContactStatuses.ts` | Agregar `is_visible`, `toggleVisibility`, `visibleStatuses` |
| `src/features/leads-pipeline/hooks/useLeadPipelineColumns.ts` | Deprecar → Wrapper a `useContactStatuses` |
| `src/features/leads-pipeline/components/LeadsPipelineView.tsx` | Usar `useContactStatuses` |
| `src/features/leads-pipeline/components/PipelineColumnsEditor.tsx` | Eliminar, usar `StatusesEditor` |
| `src/features/leads-pipeline/components/ColumnEditModal.tsx` | Eliminar |
| `src/features/leads-pipeline/components/ColumnDeleteDialog.tsx` | Eliminar |
| `src/components/admin/contacts/StatusesEditor.tsx` | Agregar toggle de visibilidad |
| `src/components/admin/contacts/StatusEditModal.tsx` | Agregar campo `is_visible` |

### Migración SQL Completa

```sql
-- 1. Agregar columna is_visible a contact_statuses
ALTER TABLE contact_statuses 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. Sincronizar valores iniciales
UPDATE contact_statuses SET is_visible = is_active;

-- 3. (Opcional) Comentar tabla deprecated
COMMENT ON TABLE lead_pipeline_columns IS 
'DEPRECATED: Usar contact_statuses. Mantener para rollback hasta validación completa.';
```

## Secuencia de Implementación

```text
┌─────────────────────────────────────────────────────────────┐
│  1. MIGRACIÓN SQL                                           │
│     - Agregar is_visible a contact_statuses                 │
│     - Sincronizar valores                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. EXTENDER useContactStatuses                             │
│     - Agregar is_visible al tipo                            │
│     - Agregar toggleVisibility mutation                     │
│     - Agregar visibleStatuses getter                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. DEPRECAR useLeadPipelineColumns                         │
│     - Convertir en wrapper de useContactStatuses            │
│     - Mantener API pública para compatibilidad              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. MIGRAR COMPONENTES PIPELINE                             │
│     - LeadsPipelineView → useContactStatuses                │
│     - Eliminar componentes duplicados                       │
│     - Unificar editor de estados                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. VERIFICACIÓN Y CLEANUP                                  │
│     - Probar /admin/contacts (tabla + pipeline)             │
│     - Probar /admin/leads-pipeline                          │
│     - Eliminar código deprecated                            │
└─────────────────────────────────────────────────────────────┘
```

## Beneficios de la Unificación

1. **Una sola fuente de verdad**: Cambios en estados reflejados instantáneamente en todos los módulos
2. **Menos código**: Eliminar ~300 líneas de código duplicado
3. **Consistencia**: Mismos colores, iconos y labels en CRM, Pipeline y Métricas
4. **Mantenimiento simplificado**: Un solo editor, un solo hook
5. **Extensibilidad**: Nuevos campos como `is_prospect_stage` automáticamente disponibles en pipeline

## Riesgo

- **Medio-Bajo**: Cambios son aditivos (nuevos campos) antes de eliminar código
- La tabla `lead_pipeline_columns` se mantiene como backup
- El hook `useLeadPipelineColumns` se convierte en wrapper (API compatible)

## Sección Técnica: Detalle de Implementación

### Hook Unificado (extracto)

```typescript
// useContactStatuses.ts - Extensiones
export interface ContactStatus {
  id: string;
  status_key: string;
  label: string;
  color: string;
  icon: string;
  position: number;
  is_active: boolean;
  is_system: boolean;
  is_prospect_stage: boolean;
  is_visible: boolean;  // NUEVO
}

export const useContactStatuses = () => {
  // ... código existente
  
  // NUEVO: Para compatibilidad con pipeline
  const visibleStatuses = statuses.filter(s => s.is_visible);
  
  // NUEVO: Toggle visibilidad (distinto de activar/desactivar)
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from('contact_statuses')
        .update({ is_visible: isVisible })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact-statuses'] }),
  });
  
  return {
    // ... existentes
    visibleStatuses,           // NUEVO
    toggleVisibility: toggleVisibilityMutation.mutate, // NUEVO
  };
};
```

### Wrapper de Compatibilidad

```typescript
// useLeadPipelineColumns.ts - Convertir a wrapper
import { useContactStatuses } from '@/hooks/useContactStatuses';

/** @deprecated Usar useContactStatuses directamente */
export const useLeadPipelineColumns = () => {
  const {
    statuses: columns,
    visibleStatuses: visibleColumns,
    isLoading,
    toggleVisibility,
    updateStatus: updateColumn,
    addStatus: addColumn,
    deleteStatus: deleteColumn,
    reorderStatuses: reorderColumns,
  } = useContactStatuses();
  
  // Adaptar nombres para compatibilidad con código existente
  return {
    columns: columns.map(s => ({ ...s, stage_key: s.status_key })),
    visibleColumns: visibleColumns.map(s => ({ ...s, stage_key: s.status_key })),
    isLoading,
    toggleVisibility,
    updateColumn,
    addColumn,
    deleteColumn,
    reorderColumns,
  };
};
```
