
# Plan: Gestión de Prospectos — Puente entre Admin y CRM

## Resumen Ejecutivo

Crear un nuevo apartado **"Gestión de Prospectos"** en el CRM que liste automáticamente los leads avanzados (estados de etapa prospecto) y permita acceder **directamente** a los perfiles de empresa **ya existentes** en `/admin/empresas/:id`.

**Requisito crítico**: NO crear nuevos perfiles de empresa bajo ningún concepto. El sistema solo sirve como "puente" para navegar al perfil de empresa existente vinculado al lead.

---

## Arquitectura Propuesta

```text
┌───────────────────────────────────────────────────────────────────┐
│                        FUENTE DE DATOS                            │
│                                                                   │
│  ┌─────────────────┐      ┌──────────────────────┐               │
│  │ contact_statuses│      │ contacts (leads)     │               │
│  │ + is_prospect_  │──────│ + empresa_id (FK)    │               │
│  │   stage: BOOL   │      │ + lead_status_crm    │               │
│  └─────────────────┘      └──────────────────────┘               │
│                                    │                              │
│                                    ▼                              │
│                    ┌───────────────────────────────┐             │
│                    │      empresas (YA EXISTEN)    │             │
│                    │  id, nombre, sector, ...      │             │
│                    └───────────────────────────────┘             │
│                                    │                              │
│                                    ▼                              │
│             ┌──────────────────────────────────────────┐         │
│             │        GESTIÓN DE PROSPECTOS             │         │
│             │  Lista leads con is_prospect_stage=true  │         │
│             │  + empresa_id NOT NULL                   │         │
│             │                                          │         │
│             │  ┌──────────────────────────────────┐   │         │
│             │  │  Botón "Abrir perfil"            │   │         │
│             │  │  → /admin/empresas/:empresa_id    │   │         │
│             │  └──────────────────────────────────┘   │         │
│             └──────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────────────┘
```

---

## Cambios Técnicos

### 1. Migración SQL: Añadir `is_prospect_stage` a `contact_statuses`

```sql
-- Añadir campo para marcar estados de etapa prospecto
ALTER TABLE public.contact_statuses 
ADD COLUMN IF NOT EXISTS is_prospect_stage BOOLEAN NOT NULL DEFAULT false;

-- Marcar los estados que corresponden a etapa prospecto
UPDATE public.contact_statuses 
SET is_prospect_stage = true 
WHERE status_key IN ('reunion_programada', 'psh_enviada', 'video');

-- Los admins podrán marcar/desmarcar desde el configurador de estados
```

**Nota**: Los estados exactos se configurarán desde el editor de estados existente. Esta migración solo marca los defaults.

---

### 2. Actualizar Hook `useContactStatuses.ts`

Añadir el campo `is_prospect_stage` al interface y exponer helper:

```typescript
export interface ContactStatus {
  // ... campos existentes
  is_prospect_stage: boolean; // NUEVO
}

// Exponer getter para filtrar estados prospecto
const prospectStatuses = statuses.filter(s => s.is_prospect_stage && s.is_active);
```

---

### 3. Crear Hook `useProspects.ts`

Query centralizada para obtener prospectos:

```typescript
// src/hooks/useProspects.ts
export const useProspects = () => {
  const { prospectStatusKeys } = useContactStatuses();
  
  const query = useQuery({
    queryKey: ['prospects'],
    queryFn: async () => {
      // 1. Obtener status_keys de etapa prospecto
      const { data: prospectStatuses } = await supabase
        .from('contact_statuses')
        .select('status_key')
        .eq('is_prospect_stage', true)
        .eq('is_active', true);
      
      const statusKeys = prospectStatuses?.map(s => s.status_key) || [];
      
      // 2. Obtener leads con esos estados Y empresa_id
      const { data: valuationLeads } = await supabase
        .from('company_valuations')
        .select(`
          id, contact_name, email, lead_status_crm, created_at, updated_at,
          empresa_id,
          empresas:empresa_id(id, nombre, sector, ubicacion, facturacion)
        `)
        .in('lead_status_crm', statusKeys)
        .not('empresa_id', 'is', null)
        .eq('is_deleted', false);
      
      const { data: contactLeads } = await supabase
        .from('contact_leads')
        .select(`
          id, full_name, email, lead_status_crm, created_at, updated_at,
          empresa_id, company,
          empresas:empresa_id(id, nombre, sector, ubicacion, facturacion)
        `)
        .in('lead_status_crm', statusKeys)
        .not('empresa_id', 'is', null)
        .eq('is_deleted', false);
      
      // 3. Unificar y agrupar por empresa
      return unifyAndGroupByEmpresa([...valuationLeads, ...contactLeads]);
    }
  });
  
  return { prospects: query.data, isLoading: query.isLoading };
};
```

---

### 4. Crear Página `ProspectsPage.tsx`

Nueva página para listar prospectos:

| Archivo | Ubicación |
|---------|-----------|
| `src/pages/admin/ProspectsPage.tsx` | Página principal |
| `src/components/admin/prospects/ProspectsTable.tsx` | Tabla de prospectos |
| `src/components/admin/prospects/ProspectFilters.tsx` | Filtros |

**Estructura de la tabla**:

| Columna | Descripción |
|---------|-------------|
| Empresa | Nombre de la empresa vinculada |
| Contacto(s) | Nombres de contactos del lead |
| Estado | Badge con color del estado |
| Canal | Origen del lead |
| Fecha registro | Fecha de creación |
| Última actualización | Fecha de última modificación |
| **Acción** | Botón "Abrir perfil" → `/admin/empresas/:empresa_id` |

**Filtros**:
- Búsqueda por empresa/contacto/email
- Filtro por estado (solo estados prospecto)
- Filtro por canal
- Rango de fechas

---

### 5. Actualizar Router y Sidebar

**AdminRouter.tsx**:
```typescript
<Route path="/prospectos" element={<LazyProspectsPage />} />
```

**sidebar-config.ts** — Nueva sección CRM:
```typescript
{
  title: "💼 CRM",
  description: "Gestión de prospectos y oportunidades",
  items: [
    { 
      title: "Gestión de Prospectos", 
      url: "/admin/prospectos", 
      icon: Target,
      description: "Leads avanzados con perfil de empresa"
    },
  ]
}
```

---

### 6. Actualizar Editor de Estados

En el configurador de estados existente (`StatusEditorPanel` o similar), añadir toggle:

```typescript
<div className="flex items-center justify-between">
  <Label htmlFor="is-prospect">Etapa Prospecto</Label>
  <Switch
    id="is-prospect"
    checked={status.is_prospect_stage}
    onCheckedChange={(checked) => updateStatus(status.id, { is_prospect_stage: checked })}
  />
</div>
<p className="text-xs text-muted-foreground">
  Los leads en este estado aparecerán en "Gestión de Prospectos"
</p>
```

---

### 7. (Futuro) Preparar Modelo para Estado del Prospecto

Para la siguiente fase, se creará una tabla opcional:

```sql
-- FASE 2: Solo si se implementa gestión de outcomes
CREATE TABLE prospect_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  outcome_state TEXT CHECK (outcome_state IN ('activo', 'pausado', 'perdido', 'convertido')),
  lost_reason TEXT,
  paused_reason TEXT,
  converted_mandate_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Nota**: Esta tabla es **opcional para fase 1**. El estado actual se deriva del `lead_status_crm` del lead.

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/migrations/[new].sql` | Crear | Añadir `is_prospect_stage` a `contact_statuses` |
| `src/hooks/useContactStatuses.ts` | Modificar | Añadir `is_prospect_stage` al interface |
| `src/hooks/useProspects.ts` | Crear | Hook para obtener prospectos |
| `src/pages/admin/ProspectsPage.tsx` | Crear | Página principal |
| `src/components/admin/prospects/ProspectsTable.tsx` | Crear | Tabla de prospectos |
| `src/components/admin/prospects/ProspectFilters.tsx` | Crear | Filtros |
| `src/components/admin/prospects/index.ts` | Crear | Barrel exports |
| `src/features/admin/components/AdminRouter.tsx` | Modificar | Añadir ruta `/prospectos` |
| `src/features/admin/config/sidebar-config.ts` | Modificar | Añadir sección CRM |
| `src/components/admin/contacts/StatusEditorPanel.tsx` | Modificar | Añadir toggle `is_prospect_stage` |
| `src/integrations/supabase/types.ts` | Regenerar | Incluir nuevo campo |

---

## Validaciones de Calidad

| Test | Resultado Esperado |
|------|-------------------|
| Lead en estado NO-prospecto → no aparece | ✅ Filtrado correctamente |
| Cambiar estado a "Reunión programada" → aparece | ✅ Query incluye el lead |
| Click "Abrir perfil" → abre empresa existente | ✅ Navega a `/admin/empresas/:id` |
| Lead SIN `empresa_id` → no aparece | ✅ Query filtra `empresa_id NOT NULL` |
| Renombrar estado → sigue funcionando | ✅ Usa `is_prospect_stage`, no texto |
| Empresa con 2 contactos → no se duplica | ✅ Agrupación por `empresa_id` |
| Lead sin empresa vinculada → mostrar CTA para vincular | ✅ UX clara |

---

## Permisos (RLS)

- Solo usuarios con rol `admin` o `super_admin` pueden acceder a `/admin/prospectos`
- La navegación a `/admin/empresas/:id` respeta los permisos existentes de empresas

---

## NO SE MODIFICA

- ❌ Creación de empresas — nunca se crean desde este módulo
- ❌ Tabla `empresas` — solo lectura
- ❌ Lógica de leads existente — se reutiliza
- ❌ Panel lateral de lead — se reutiliza
- ❌ Filtros del CRM principal — se heredan

---

## Beneficios

1. **Puente eficiente**: Acceso directo al perfil de empresa desde leads avanzados
2. **Configuración flexible**: Los admins deciden qué estados son "prospecto"
3. **Cero duplicación**: Usa empresas existentes, no crea nada
4. **Trazabilidad**: Histórico del lead se mantiene en Admin
5. **Escalable**: Preparado para añadir outcomes (convertido/perdido/pausado)
