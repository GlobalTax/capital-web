
# Plan: Sistema de Estados Configurables para Contactos

## Resumen Ejecutivo

Implementar un sistema de estados configurable para `/admin/contacts` que permita:
- Crear, editar y desactivar estados sin perder datos historicos
- Reordenar estados visualmente
- Cambiar estados de contactos con garantia de persistencia

## Analisis del Estado Actual

### Situacion Actual

| Elemento | Estado |
|----------|--------|
| Campo en BD | `lead_status_crm` (ENUM) en `contact_leads`, `company_valuations`, `collaborator_applications` |
| Valores ENUM | `nuevo, contactando, calificado, propuesta_enviada, negociacion, en_espera, ganado, perdido, archivado, fase0_activo, fase0_bloqueado, mandato_propuesto, mandato_firmado` |
| Contactos existentes | ~1,196 registros distribuidos en 3 tablas |
| UI actual | Hardcodeado en `LeadStatusBadge.tsx` y `LeadStatusSelect.tsx` |

### Sistema Existente de Referencia

El proyecto ya tiene un sistema similar en **Leads Pipeline** con la tabla `lead_pipeline_columns`:
- Columnas dinamicas con `stage_key`, `label`, `color`, `icon`, `position`
- Hook `useLeadPipelineColumns.ts` para CRUD
- Componente `PipelineColumnsEditor.tsx` con drag-and-drop

## Arquitectura de la Solucion

### Fase 1: Nueva Tabla `contact_statuses`

```sql
CREATE TABLE public.contact_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key TEXT NOT NULL UNIQUE,      -- Clave estable (nunca cambia)
  label TEXT NOT NULL,                   -- Nombre visible (editable)
  color TEXT NOT NULL DEFAULT 'gray',    -- Color del badge
  icon TEXT DEFAULT '📋',                -- Emoji/icono
  position INTEGER NOT NULL DEFAULT 0,   -- Orden de visualizacion
  is_active BOOLEAN NOT NULL DEFAULT true,  -- Desactivar sin borrar
  is_system BOOLEAN NOT NULL DEFAULT false, -- Estados protegidos
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Datos Iniciales (Migracion)

```sql
INSERT INTO contact_statuses (status_key, label, color, icon, position, is_system) VALUES
('nuevo', 'Nuevo', 'blue', '📥', 1, true),
('contactando', 'Contactando', 'purple', '📞', 2, false),
('calificado', 'Calificado', 'cyan', '✅', 3, false),
('propuesta_enviada', 'Propuesta Enviada', 'indigo', '📄', 4, false),
('negociacion', 'Negociacion', 'orange', '🤝', 5, false),
('en_espera', 'En Espera', 'yellow', '⏸️', 6, false),
('ganado', 'Ganado', 'green', '🏆', 7, true),
('perdido', 'Perdido', 'red', '❌', 8, true),
('archivado', 'Archivado', 'gray', '📦', 9, false),
('fase0_activo', 'Fase 0 Activo', 'emerald', '🚀', 10, false),
('fase0_bloqueado', 'Fase 0 Bloqueado', 'slate', '🔒', 11, false),
('mandato_propuesto', 'Mandato Propuesto', 'amber', '📋', 12, false),
('mandato_firmado', 'Mandato Firmado', 'teal', '✍️', 13, false);
```

### RLS Policies

```sql
-- Lectura publica (autenticados)
CREATE POLICY "Authenticated can read statuses"
ON contact_statuses FOR SELECT
TO authenticated USING (true);

-- Escritura solo admins
CREATE POLICY "Admins can manage statuses"
ON contact_statuses FOR ALL
TO authenticated USING (public.has_role(auth.uid(), 'admin'));
```

## Componentes a Crear/Modificar

### 1. Hook `useContactStatuses.ts` (Nuevo)

Siguiendo el patron de `useLeadPipelineColumns.ts`:

```typescript
export interface ContactStatus {
  id: string;
  status_key: string;
  label: string;
  color: string;
  icon: string;
  position: number;
  is_active: boolean;
  is_system: boolean;
}

export const useContactStatuses = () => {
  // Query: fetch all statuses ordered by position
  // Mutations: updateStatus, addStatus, toggleActive, reorder
  // Computed: activeStatuses (is_active=true)
  return { statuses, activeStatuses, isLoading, ... };
};
```

### 2. Componente `StatusesEditor.tsx` (Nuevo)

Panel lateral accesible desde `/admin/contacts`:

```text
┌─────────────────────────────────────────────┐
│  ⚙️ Configurar Estados                      │
│ ─────────────────────────────────────────── │
│  [+ Anadir estado]                          │
│                                             │
│  ☰ 📥 Nuevo           🔵  👁️ ✏️            │
│  ☰ 📞 Contactando     🟣  👁️ ✏️ 🗑️         │
│  ☰ ✅ Calificado      🔵  👁️ ✏️ 🗑️         │
│  ☰ 📄 Propuesta       🟣  👁️ ✏️ 🗑️         │
│  ☰ 🤝 Negociacion     🟠  👁️ ✏️ 🗑️         │
│  ☰ 🏆 Ganado          🟢  👁️ ✏️            │
│  ☰ ❌ Perdido         🔴  👁️ ✏️            │
│                                             │
│  💡 Estados del sistema no se pueden borrar │
│  💡 Desactivar oculta del selector          │
└─────────────────────────────────────────────┘
```

Funcionalidades:
- Drag-and-drop con `@hello-pangea/dnd` (ya instalado)
- Crear/editar estados via modal
- Toggle visibilidad (is_active)
- Proteccion de estados del sistema

### 3. Modal `StatusEditModal.tsx` (Nuevo)

Similar a `ColumnEditModal.tsx`:

```text
┌─────────────────────────────────────────────┐
│  Editar Estado                              │
│ ─────────────────────────────────────────── │
│  Nombre: [Contactando________]              │
│                                             │
│  Clave: contactando (no editable)           │
│                                             │
│  Icono: [📞] [📥] [✅] [📄] [🤝] [⏸️] ...   │
│                                             │
│  Color: 🔵 🟣 🟢 🟠 🔴 ⬜ 🟡 ...            │
│                                             │
│  Vista previa: [📞 Contactando]             │
│                                             │
│         [Cancelar]  [Guardar cambios]       │
└─────────────────────────────────────────────┘
```

### 4. Modificaciones a Componentes Existentes

| Archivo | Cambio |
|---------|--------|
| `ContactTableRow.tsx` | Reemplazar `STATUS_OPTIONS` hardcodeado por datos de `useContactStatuses()` |
| `LeadStatusSelect.tsx` | Cargar opciones desde `useContactStatuses()` |
| `LeadStatusBadge.tsx` | Buscar config en statuses dinamicos, fallback a default |
| `LinearContactsManager.tsx` | Anadir boton "⚙️ Gestionar Estados" en header |

### 5. Selector de Estado Actualizado

```typescript
// LeadStatusSelect.tsx actualizado
export function LeadStatusSelect({ leadId, leadType, currentStatus }) {
  const { activeStatuses, isLoading } = useContactStatuses();
  
  // Si el status actual esta inactivo, incluirlo con badge "(Inactivo)"
  const options = useMemo(() => {
    const active = activeStatuses.map(s => ({
      value: s.status_key,
      label: s.label,
      icon: s.icon,
      color: s.color,
    }));
    
    // Si el status actual no esta en activos, agregarlo
    if (currentStatus && !active.find(o => o.value === currentStatus)) {
      const inactiveStatus = statuses.find(s => s.status_key === currentStatus);
      if (inactiveStatus) {
        active.unshift({
          value: inactiveStatus.status_key,
          label: `${inactiveStatus.label} (Inactivo)`,
          icon: inactiveStatus.icon,
          color: 'gray',
        });
      }
    }
    
    return active;
  }, [activeStatuses, currentStatus, statuses]);
  
  // ... resto del componente
}
```

## Flujo de Cambio de Estado

```text
1. Usuario abre selector de estado
2. Carga opciones desde contact_statuses (is_active=true)
3. Usuario selecciona nuevo estado
4. Mutation: UPDATE contact_leads SET lead_status_crm = 'nuevo_estado' WHERE id = ?
5. Invalidar queries ['unified-contacts']
6. Toast de exito
```

**Nota importante**: El campo `lead_status_crm` seguira siendo un ENUM en la BD. Solo agregamos el ENUM value cuando se crea un nuevo estado (via migracion manual o automatica).

## Estrategia de Compatibilidad

### Opcion A: Mantener ENUM + Tabla de Metadatos (Recomendada)

- `lead_status_crm` sigue siendo ENUM (integridad garantizada)
- `contact_statuses` es tabla de **metadatos** (label, color, icon, order)
- Nuevos estados requieren `ALTER TYPE lead_status ADD VALUE 'nuevo_estado'`

**Ventajas**: Seguridad de tipos, no rompe nada existente
**Desventajas**: Crear nuevos estados requiere migracion SQL

### Opcion B: Migrar a TEXT + Foreign Key

- Cambiar `lead_status_crm` de ENUM a TEXT
- Agregar FK constraint a `contact_statuses.status_key`

**Ventajas**: Crear estados desde UI sin migraciones
**Desventajas**: Requiere migracion de columna existente

**Decision**: Implementamos **Opcion A** para minimo impacto. Se puede evolucionar a Opcion B en el futuro.

## Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/hooks/useContactStatuses.ts` | Hook para CRUD de estados |
| `src/components/admin/contacts/StatusesEditor.tsx` | Panel de configuracion |
| `src/components/admin/contacts/StatusEditModal.tsx` | Modal crear/editar estado |
| `src/components/admin/contacts/StatusDeleteDialog.tsx` | Confirmacion de desactivacion |

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/leads/LeadStatusSelect.tsx` | Cargar opciones desde hook |
| `src/components/admin/leads/LeadStatusBadge.tsx` | Config dinamica con fallback |
| `src/components/admin/contacts/ContactTableRow.tsx` | Eliminar `STATUS_OPTIONS` hardcodeado |
| `src/components/admin/contacts/LinearContactsManager.tsx` | Boton "Gestionar Estados" |
| `src/integrations/supabase/types.ts` | Se actualiza automaticamente |

## Migracion SQL

```sql
-- 1. Crear tabla contact_statuses
CREATE TABLE IF NOT EXISTS public.contact_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'gray',
  icon TEXT DEFAULT '📋',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.contact_statuses ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Authenticated can read statuses"
ON public.contact_statuses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage statuses"
ON public.contact_statuses FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Insertar estados iniciales basados en ENUM actual
INSERT INTO public.contact_statuses (status_key, label, color, icon, position, is_system) VALUES
('nuevo', 'Nuevo', 'blue', '📥', 1, true),
('contactando', 'Contactando', 'purple', '📞', 2, false),
('calificado', 'Calificado', 'cyan', '✅', 3, false),
('propuesta_enviada', 'Propuesta Enviada', 'indigo', '📄', 4, false),
('negociacion', 'Negociación', 'orange', '🤝', 5, false),
('en_espera', 'En Espera', 'yellow', '⏸️', 6, false),
('ganado', 'Ganado', 'green', '🏆', 7, true),
('perdido', 'Perdido', 'red', '❌', 8, true),
('archivado', 'Archivado', 'gray', '📦', 9, false),
('fase0_activo', 'Fase 0 Activo', 'emerald', '🚀', 10, false),
('fase0_bloqueado', 'Fase 0 Bloqueado', 'slate', '🔒', 11, false),
('mandato_propuesto', 'Mandato Propuesto', 'amber', '📋', 12, false),
('mandato_firmado', 'Mandato Firmado', 'teal', '✍️', 13, false)
ON CONFLICT (status_key) DO NOTHING;

-- 5. Indice para ordenacion
CREATE INDEX idx_contact_statuses_position ON public.contact_statuses(position);
```

## Plan de Implementacion

### Paso 1: Base de Datos
- Ejecutar migracion SQL para crear `contact_statuses`
- Verificar datos iniciales

### Paso 2: Hook y Logica
- Crear `useContactStatuses.ts`
- Tests basicos de CRUD

### Paso 3: UI de Gestion
- Crear `StatusesEditor.tsx`
- Crear `StatusEditModal.tsx`
- Integrar en `LinearContactsManager.tsx`

### Paso 4: Actualizar Selectores
- Modificar `LeadStatusSelect.tsx`
- Modificar `LeadStatusBadge.tsx`
- Modificar `ContactTableRow.tsx`

### Paso 5: Testing
- Crear estado nuevo y asignar a contacto
- Editar label/color y verificar reflejo en UI
- Desactivar estado y verificar que contactos lo mantienen
- Cambiar estado en contacto y refrescar

## Estimacion

| Componente | Tiempo Estimado |
|------------|-----------------|
| Migracion SQL | 5 min |
| `useContactStatuses.ts` | 15 min |
| `StatusesEditor.tsx` | 25 min |
| `StatusEditModal.tsx` | 15 min |
| Modificar selectores | 20 min |
| Testing | 10 min |
| **Total** | **~90 min** |

## Riesgos y Mitigaciones

| Riesgo | Mitigacion |
|--------|------------|
| Estados huerfanos | Fallback a config por defecto en LeadStatusBadge |
| ENUM no soporta nuevos valores | Documentar que nuevos estados requieren migracion |
| Performance | Cache con staleTime 5min en hook |
| Borrado accidental | Solo desactivar, nunca eliminar |

## Resultado Final

- Panel de gestion de estados accesible desde `/admin/contacts`
- Estados con nombre, color, icono y orden personalizables
- Cambio de estado en contactos persistente y consistente
- Compatibilidad total con datos existentes
- Estructura preparada para futura migracion a TEXT si se desea
