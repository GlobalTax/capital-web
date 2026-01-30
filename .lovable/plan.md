
# Plan: Histórico de Cambios de Estado para Leads

## Resumen Ejecutivo

Implementar un sistema completo de tracking de cambios de estado que:
- Capture TODOS los cambios de estado (individual, masivo, desde cualquier punto del CRM)
- Muestre el historial en el panel lateral del lead
- Permita calcular conversiones futuras entre estados

## Diagnóstico Actual

### Lo que YA existe
| Componente | Estado | Notas |
|------------|--------|-------|
| Tabla `lead_activities` | Completa | Soporta `status_changed` con metadata JSONB |
| Trigger para `company_valuations` | Activo | Registra cambios automáticamente |
| Componente `ActivityTimeline` | Completo | Muestra timeline con iconos y fechas |
| Hook `useLeadActivities` | Completo | Query para obtener actividades |

### Lo que FALTA
| Componente | Problema |
|------------|----------|
| Triggers en otras tablas | `contact_leads`, `collaborator_applications`, `acquisition_leads`, `general_contact_leads` no tienen triggers |
| Edge Function bulk | No registra actividades (usa service_role, bypassa triggers) |
| Panel lateral | No muestra el timeline de actividades |
| Metadata `change_source` | No se guarda la fuente del cambio |

## Arquitectura de la Solución

```text
+-------------------+     +-------------------+     +-------------------+
|   UI: Tabla       |     |  UI: Panel Lead   |     |   UI: Pipeline    |
|   (inline edit)   |     |  (LeadStatusSelect)|    |   (drag & drop)   |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                         |
         v                         v                         v
+--------+----------+     +--------+----------+     +--------+----------+
| useContactInline  |     |  statusMutation   |     | updateStatus      |
| Update            |     |  (direct SDK)     |     | Mutation          |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                         |
         +------------+------------+-------------------------+
                      |
                      v
         +------------+------------+
         |     Supabase SDK        |
         |  UPDATE lead_status_crm |
         +------------+------------+
                      |
                      v
         +------------+------------+
         |   TRIGGER (Postgres)    |<--- Se ejecuta SIEMPRE
         | log_lead_status_change  |     (no depende del frontend)
         +------------+------------+
                      |
                      v
         +------------+------------+
         |   INSERT INTO           |
         |   lead_activities       |
         +-------------------------+


         FLUJO MASIVO (Edge Function)
         +-------------------+
         |  Bulk Update UI   |
         +--------+----------+
                  |
                  v
         +--------+----------+
         | bulk-update-contacts |<--- Usa service_role (bypassa RLS)
         | Edge Function        |     pero TAMBIÉN bypassa triggers
         +--------+----------+
                  |
                  v
         +--------+----------+
         | INSERT lead_activities |<--- Debemos insertar manualmente
         | dentro de la transacción|
         +-------------------------+
```

## Plan de Implementación

### Fase 1: Base de Datos (Migración SQL)

**1.1 Crear triggers para TODAS las tablas de leads**

Función genérica que:
- Recibe el `lead_type` como parámetro
- Guarda `old_status`, `new_status`, y opcionalmente `change_source` en metadata
- Usa `auth.uid()` para el `created_by`

```sql
-- Función genérica para loggear cambios de estado
CREATE OR REPLACE FUNCTION public.log_unified_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_type TEXT;
BEGIN
  -- Solo si realmente cambió el estado
  IF OLD.lead_status_crm IS NOT DISTINCT FROM NEW.lead_status_crm THEN
    RETURN NEW;
  END IF;
  
  -- Determinar lead_type según la tabla
  v_lead_type := CASE TG_TABLE_NAME
    WHEN 'company_valuations' THEN 'valuation'
    WHEN 'contact_leads' THEN 'contact'
    WHEN 'collaborator_applications' THEN 'collaborator'
    WHEN 'acquisition_leads' THEN 'acquisition'
    WHEN 'general_contact_leads' THEN 'general'
    WHEN 'advisor_valuations' THEN 'advisor'
    ELSE 'unknown'
  END;
  
  INSERT INTO public.lead_activities (
    lead_id, lead_type, activity_type, description, metadata, created_by
  ) VALUES (
    NEW.id,
    v_lead_type,
    'status_changed',
    'Estado cambiado de ' || COALESCE(OLD.lead_status_crm::text, 'sin estado') 
      || ' a ' || COALESCE(NEW.lead_status_crm::text, 'sin estado'),
    jsonb_build_object(
      'from_status', OLD.lead_status_crm,
      'to_status', NEW.lead_status_crm,
      'change_source', 'direct_update'  -- Default, se sobreescribe por frontend si aplica
    ),
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

**1.2 Crear triggers en cada tabla**

```sql
-- contact_leads
CREATE TRIGGER trigger_log_contact_status_change
  AFTER UPDATE ON public.contact_leads
  FOR EACH ROW
  WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm)
  EXECUTE FUNCTION public.log_unified_status_change();

-- collaborator_applications
CREATE TRIGGER trigger_log_collaborator_status_change
  AFTER UPDATE ON public.collaborator_applications
  FOR EACH ROW
  WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm)
  EXECUTE FUNCTION public.log_unified_status_change();

-- acquisition_leads
CREATE TRIGGER trigger_log_acquisition_status_change
  AFTER UPDATE ON public.acquisition_leads
  FOR EACH ROW
  WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm)
  EXECUTE FUNCTION public.log_unified_status_change();

-- general_contact_leads
CREATE TRIGGER trigger_log_general_status_change
  AFTER UPDATE ON public.general_contact_leads
  FOR EACH ROW
  WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm)
  EXECUTE FUNCTION public.log_unified_status_change();

-- advisor_valuations
CREATE TRIGGER trigger_log_advisor_status_change
  AFTER UPDATE ON public.advisor_valuations
  FOR EACH ROW
  WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm)
  EXECUTE FUNCTION public.log_unified_status_change();
```

**1.3 Actualizar el trigger existente de company_valuations**

Reemplazar la función `log_lead_status_change` para usar la nueva función unificada.

### Fase 2: Edge Function (Bulk Update)

Modificar `bulk-update-contacts` para registrar actividades manualmente cuando actualiza estados:

```typescript
// Si se actualiza lead_status_crm, registrar en lead_activities
if (updates.lead_status_crm) {
  // Para cada lead actualizado, insertar actividad
  const activityInserts = ids.map(id => ({
    lead_id: id,
    lead_type: leadType, // 'valuation', 'contact', etc.
    activity_type: 'status_changed',
    description: `Estado cambiado a ${updates.lead_status_crm} (masivo)`,
    metadata: {
      to_status: updates.lead_status_crm,
      change_source: 'bulk',
      bulk_count: contact_ids.length
    },
    created_by: null // service_role no tiene auth.uid()
  }));
  
  await supabase.from('lead_activities').insert(activityInserts);
}
```

**Importante**: Como la Edge Function usa `service_role`, los triggers NO se ejecutan automáticamente. Debemos insertar las actividades manualmente.

### Fase 3: UI - Mostrar Timeline en Panel Lateral

**3.1 Crear componente compacto para el panel**

Nuevo archivo: `src/components/admin/contacts/StatusHistoryTimeline.tsx`

```typescript
interface StatusHistoryTimelineProps {
  leadId: string;
  leadType: string;
  maxItems?: number; // Default 5, con "Ver más"
}

export const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({
  leadId,
  leadType,
  maxItems = 5
}) => {
  // Query filtrada solo por status_changed
  const { data: activities } = useQuery({
    queryKey: ['status-history', leadId],
    queryFn: async () => {
      const { data } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .eq('activity_type', 'status_changed')
        .order('created_at', { ascending: false })
        .limit(maxItems + 1); // +1 para saber si hay más
      return data;
    }
  });
  
  // Render timeline compacto
  // ...
};
```

**3.2 Integrar en ContactDetailSheet**

Añadir después del bloque "Estado del lead":

```tsx
<Separator className="bg-[hsl(var(--linear-border))] my-4" />

{/* Histórico de Estados */}
<div className="space-y-1 mb-6">
  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
    Histórico de estados
  </h3>
  <StatusHistoryTimeline 
    leadId={contact.id} 
    leadType={contact.origin}
  />
</div>
```

### Fase 4: Mejoras Opcionales (Preparación Analytics)

**4.1 Añadir índice compuesto para analytics de conversiones**

```sql
CREATE INDEX idx_lead_activities_status_analytics 
ON lead_activities (activity_type, (metadata->>'from_status'), (metadata->>'to_status'))
WHERE activity_type = 'status_changed';
```

**4.2 Vista para facilitar queries de conversiones**

```sql
CREATE VIEW v_status_transitions AS
SELECT 
  lead_id,
  lead_type,
  metadata->>'from_status' as from_status,
  metadata->>'to_status' as to_status,
  metadata->>'change_source' as change_source,
  created_at,
  created_by
FROM lead_activities
WHERE activity_type = 'status_changed';
```

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `supabase/migrations/XXX_status_history_triggers.sql` | Crear | Triggers para todas las tablas |
| `supabase/functions/bulk-update-contacts/index.ts` | Modificar | Insertar actividades en bulk |
| `src/components/admin/contacts/StatusHistoryTimeline.tsx` | Crear | Componente timeline compacto |
| `src/components/admin/contacts/ContactDetailSheet.tsx` | Modificar | Integrar StatusHistoryTimeline |
| `src/hooks/useStatusHistory.ts` | Crear | Hook para obtener historial filtrado |

## Flujo de Datos Final

```text
                    CAMBIO DE ESTADO
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
      Tabla           Panel          Bulk Action
    (inline)       (selector)        (masivo)
          |               |               |
          v               v               v
      SDK Update      SDK Update    Edge Function
          |               |               |
          v               v               |
      TRIGGER         TRIGGER             |
   (automático)    (automático)           |
          |               |               |
          v               v               v
         INSERT INTO lead_activities
          |
          v
    +-----+-----+
    |   lead_   |
    | activities|
    +-----------+
          |
          v
   StatusHistoryTimeline
   (Panel lateral)
```

## Pruebas Requeridas

| Test | Descripción | Resultado esperado |
|------|-------------|-------------------|
| 1 | Cambiar estado desde tabla (inline) | 1 registro en `lead_activities` con `change_source: direct_update` |
| 2 | Cambiar estado desde panel lateral | 1 registro con from/to correctos |
| 3 | Cambiar estado masivo (10 leads) | 10 registros con `change_source: bulk` |
| 4 | Abrir panel, ver timeline | Muestra cambios ordenados desc |
| 5 | Refrescar página | Timeline persiste |
| 6 | Seleccionar el mismo estado | NO crea nuevo registro |
| 7 | Renombrar un estado en config | Timeline sigue mostrando bien (usa status_key) |

## Consideraciones de Seguridad

- RLS en `lead_activities` ya existe y requiere `is_user_admin(auth.uid())`
- Los triggers usan `SECURITY DEFINER` para poder insertar en cualquier contexto
- La Edge Function usa `service_role` pero inserta manualmente respetando el schema

## Consideraciones de Performance

- Índice `idx_lead_activities_lead_id` ya existe
- Query en panel lateral limitada a 5 registros por defecto
- No hay refetch en cada cambio, solo invalidación selectiva
