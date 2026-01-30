
# Plan: Pipeline Kanban Estilo Brevo - Sincronización Total con Tabla de Contactos

## Resumen Ejecutivo

Actualmente existen **DOS sistemas paralelos desincronizados**:

| Sistema | Tabla de Estados | Hook | Ubicación |
|---------|-----------------|------|-----------|
| Tabla de Contactos | `contact_statuses` | `useContactStatuses` | `/admin/contacts` |
| Pipeline de Leads | `lead_pipeline_columns` | `useLeadPipelineColumns` | `/admin/leads-pipeline` |

**Problema crítico**: Ambos escriben sobre `lead_status_crm`, pero con configuraciones independientes. Esto causa inconsistencias y duplicación.

**Solución**: Unificar todo bajo `contact_statuses` como fuente única de verdad, eliminando la dependencia de `lead_pipeline_columns` para el Pipeline.

---

## Arquitectura Propuesta

```text
┌─────────────────────────────────────────────────────────────┐
│                    FUENTE ÚNICA DE VERDAD                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Tabla: contact_statuses                   │   │
│  │  id | status_key | label | color | icon | position  │   │
│  │  is_active | is_system                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                   useContactStatuses()                      │
│                            │                                │
│        ┌───────────────────┼───────────────────┐           │
│        ▼                   ▼                   ▼           │
│  ┌──────────┐       ┌──────────┐       ┌──────────┐        │
│  │  Filtro  │       │  Tabla   │       │ Kanban   │        │
│  │  Estado  │       │  Inline  │       │ Pipeline │        │
│  └──────────┘       └──────────┘       └──────────┘        │
│                            │                                │
│                   useContactInlineUpdate()                  │
│                 (función única de update)                   │
│                            │                                │
│                            ▼                                │
│             contacts.lead_status_crm = status_key           │
└─────────────────────────────────────────────────────────────┘
```

---

## Cambios Propuestos

### 1. Crear Nuevo Pipeline Kanban en `/admin/contacts`

**Ubicación**: Nueva pestaña "Pipeline" junto a "Favoritos", "Todos", "Estadísticas"

**No crear ruta separada**: El Pipeline vivirá dentro de `LinearContactsManager` como una pestaña más, aprovechando la misma infraestructura de filtros y datos.

### 2. Componentes a Crear

| Componente | Descripción |
|------------|-------------|
| `src/components/admin/contacts/pipeline/ContactsPipelineView.tsx` | Vista principal del Kanban |
| `src/components/admin/contacts/pipeline/PipelineColumn.tsx` | Columna individual (drag target) |
| `src/components/admin/contacts/pipeline/PipelineCard.tsx` | Tarjeta de lead (draggable) |
| `src/components/admin/contacts/pipeline/index.ts` | Barrel exports |

### 3. Flujo de Datos Unificado

```text
┌─────────────────────────────────────────────────────────────┐
│ Arrastrar tarjeta en Kanban                                 │
│            │                                                │
│            ▼                                                │
│ handleDragEnd(result)                                       │
│            │                                                │
│            ▼                                                │
│ useContactInlineUpdate().update(                            │
│   contactId,                                                │
│   origin,                                                   │
│   'lead_status_crm',                                        │
│   newStatusKey                                              │
│ )                                                           │
│            │                                                │
│            ▼                                                │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 1. Validar status_key existe en contact_statuses       ││
│ │ 2. Optimistic update en cache ['unified-contacts']     ││
│ │ 3. PATCH a tabla correcta (company_valuations, etc)    ││
│ │ 4. Invalidar queries                                   ││
│ │ 5. Toast success/error                                 ││
│ └─────────────────────────────────────────────────────────┘│
│            │                                                │
│            ▼                                                │
│ Tabla y Kanban se actualizan automáticamente (mismo cache) │
└─────────────────────────────────────────────────────────────┘
```

---

## Especificaciones Técnicas

### 3.1 ContactsPipelineView.tsx

```typescript
interface ContactsPipelineViewProps {
  contacts: UnifiedContact[];
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  onViewDetails: (contact: UnifiedContact) => void;
}

// Características:
// - Usa useContactStatuses() para columnas (activeStatuses)
// - Usa useContactInlineUpdate() para drag & drop
// - Agrupa contacts por lead_status_crm
// - Soporta todos los filtros existentes
// - Click en tarjeta abre ContactDetailSheet existente
```

### 3.2 PipelineColumn.tsx

```typescript
interface PipelineColumnProps {
  status: ContactStatus; // De contact_statuses
  contacts: UnifiedContact[];
  onViewDetails: (contact: UnifiedContact) => void;
}

// Características:
// - Droppable zone de @hello-pangea/dnd
// - Badge con contador
// - Color/icono desde contact_statuses
// - Scroll interno para muchas tarjetas
```

### 3.3 PipelineCard.tsx

```typescript
interface PipelineCardProps {
  contact: UnifiedContact;
  onViewDetails: (contact: UnifiedContact) => void;
}

// Campos visibles:
// - Empresa (company)
// - Nombre contacto (name)
// - Email
// - Canal (acquisition_channel_name)
// - Fecha registro (lead_received_at o created_at)
// - Facturación (revenue) - badge si > 1M
// - EBITDA - badge si > 100k
```

### 4. Modificar LinearContactsManager

Añadir nueva pestaña "Pipeline":

```typescript
// Nuevo estado
const [activeTab, setActiveTab] = useState<'favorites' | 'directory' | 'pipeline' | 'stats'>('favorites');

// Nueva TabsTrigger
<TabsTrigger value="pipeline" className="text-xs px-3 h-6 gap-1.5">
  <Kanban className="h-3 w-3" />
  Pipeline
</TabsTrigger>

// Nuevo TabsContent
<TabsContent value="pipeline" className="mt-0">
  <ContactsPipelineView
    contacts={displayedContacts}
    filters={filters}
    onFiltersChange={applyFilters}
    onViewDetails={handleViewDetails}
  />
</TabsContent>
```

### 5. Sincronización Bidireccional

**Ya implementado**: `useContactInlineUpdate()` maneja:
- Validación de `status_key` en `contact_statuses`
- Optimistic update en cache `['unified-contacts']`
- Rollback en caso de error
- Toast de confirmación

**El Kanban usará exactamente el mismo hook**, garantizando sincronización perfecta.

### 6. Filtros Compartidos

El Pipeline hereda automáticamente los filtros de `LinearContactsManager`:
- `applyFilters()` filtra `contacts`
- `displayedContacts` ya está filtrado
- El Pipeline recibe `displayedContacts` filtrados

### 7. Histórico de Cambios de Estado (Opcional - Fase 2)

Crear tabla `contact_status_history` para tracking:

```sql
CREATE TABLE contact_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  contact_origin TEXT NOT NULL,
  from_status_key TEXT,
  to_status_key TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  source TEXT CHECK (source IN ('table', 'kanban', 'bulk', 'api'))
);
```

**Nota**: Esta tabla es opcional para la primera iteración. Se puede añadir después sin romper nada.

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/admin/contacts/pipeline/ContactsPipelineView.tsx` | Crear | Vista principal Kanban |
| `src/components/admin/contacts/pipeline/PipelineColumn.tsx` | Crear | Columna con drop zone |
| `src/components/admin/contacts/pipeline/PipelineCard.tsx` | Crear | Tarjeta arrastrable |
| `src/components/admin/contacts/pipeline/index.ts` | Crear | Barrel exports |
| `src/components/admin/contacts/LinearContactsManager.tsx` | Modificar | Añadir pestaña Pipeline |

---

## Validaciones de Calidad

### Antes de aprobar:

| Test | Resultado Esperado |
|------|-------------------|
| Arrastrar lead en Kanban → tabla actualizada | ✅ Mismo estado inmediatamente |
| Cambiar estado en tabla inline → Kanban actualizado | ✅ Lead se mueve de columna |
| Crear estado nuevo en configurador → aparece en Kanban | ✅ Nueva columna visible |
| Desactivar estado → columna desaparece del Kanban | ✅ Leads con ese estado quedan en "Sin estado" o se muestran aparte |
| Reordenar estados → orden de columnas cambia | ✅ Automático |
| Filtrar por canal → Kanban solo muestra leads filtrados | ✅ Hereda filtros |
| Click en tarjeta → abre panel lateral | ✅ Usa ContactDetailSheet existente |
| Error de red → rollback en ambos sitios | ✅ Toast + UI consistente |

---

## No Se Modifica

- ❌ `useInlineUpdate.ts` - Ya funciona perfectamente
- ❌ `useContactStatuses.ts` - Ya es la fuente única
- ❌ `ContactDetailSheet.tsx` - Se reutiliza tal cual
- ❌ Filtros existentes - Se heredan
- ❌ `lead_pipeline_columns` - Se ignora (legacy, puede eliminarse después)

---

## Beneficios

1. **Cero duplicación**: Una sola fuente de verdad (`contact_statuses`)
2. **Sincronización perfecta**: Tabla y Kanban usan el mismo cache
3. **Filtros compartidos**: Sin reimplementar lógica
4. **Panel lateral reutilizado**: Sin nuevo código
5. **Performance**: Mismos datos ya cargados por `useUnifiedContacts`
6. **Mantenibilidad**: Menos código, menos bugs
