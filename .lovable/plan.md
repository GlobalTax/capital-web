
# Plan: Alinear status_key con Labels Actuales

## Resumen del Problema

Actualmente existe una **desalineación significativa** entre los `status_key` internos y los `label` visibles en la UI:

| status_key actual | Label visible | Nuevo status_key propuesto |
|-------------------|---------------|---------------------------|
| `contactando` | Target Lead | `target_lead` |
| `calificado` | Unqualified Lead | `unqualified_lead` |
| `propuesta_enviada` | Primer Contacto | `primer_contacto` |
| `negociacion` | Llamado - NR | `llamado_nr` |
| `en_espera` | Contacto Efectivo | `contacto_efectivo` |
| `fase0_activo` | Reunión Programada | `reunion_programada` |
| `fase0_bloqueado` | Lead Paused | `lead_paused` |
| `archivado` | PSH Enviada | `psh_enviada` |
| `mandato_propuesto` | Lead Perdido - No Core | `lead_perdido_no_core` |
| `mandato_firmado` | Video Realizada | `video_realizada` |
| `perdido` | Perdido - NR | `perdido_nr` |

## Alcance del Cambio

### Archivos Afectados (44 archivos identificados)

**Alto impacto (requieren migración de datos):**
- Tablas: `contact_leads`, `company_valuations`, `collaborator_applications` (campo `lead_status_crm`)
- Tabla: `lead_activities` (campo `metadata` contiene referencias a status_key)
- Tabla: `contact_statuses` (fuente principal de status_key)

**Código TypeScript/React:**
1. `src/components/admin/metrics/types.ts` - Constantes hardcodeadas (TERMINAL_STATUS_KEYS, etc.)
2. `src/features/leads-pipeline/types/index.ts` - Type `LeadStatus` y `PIPELINE_COLUMNS`
3. `src/components/admin/leads/LeadStatusBadge.tsx` - FALLBACK_CONFIG
4. `src/components/admin/contacts/ContactsTable.tsx` - configs de status
5. `supabase/functions/generate-rod-document/index.ts` - status 'nuevo'

### Riesgo

- **ALTO**: Este es un cambio de esquema con migración de datos masiva
- Afecta 1,256+ registros en producción
- Requiere coordinación entre migración de BD y código

## Estrategia de Migración

### Fase 1: Preparación (Sin downtime)
1. Crear nuevas columnas temporales o ejecutar UPDATE atómico
2. Mapear todos los status_key antiguos a nuevos en una sola transacción

### Fase 2: Migración de Base de Datos

```sql
-- 1. Actualizar contact_statuses (fuente de verdad)
UPDATE contact_statuses SET status_key = CASE status_key
  WHEN 'contactando' THEN 'target_lead'
  WHEN 'calificado' THEN 'unqualified_lead'
  WHEN 'propuesta_enviada' THEN 'primer_contacto'
  WHEN 'negociacion' THEN 'llamado_nr'
  WHEN 'en_espera' THEN 'contacto_efectivo'
  WHEN 'fase0_activo' THEN 'reunion_programada'
  WHEN 'fase0_bloqueado' THEN 'lead_paused'
  WHEN 'archivado' THEN 'psh_enviada'
  WHEN 'mandato_propuesto' THEN 'lead_perdido_no_core'
  WHEN 'mandato_firmado' THEN 'video_realizada'
  WHEN 'perdido' THEN 'perdido_nr'
  ELSE status_key
END;

-- 2. Actualizar contact_leads
UPDATE contact_leads SET lead_status_crm = CASE lead_status_crm
  WHEN 'contactando' THEN 'target_lead'
  -- ... mismo mapeo
  ELSE lead_status_crm
END;

-- 3. Actualizar company_valuations
UPDATE company_valuations SET lead_status_crm = CASE lead_status_crm
  WHEN 'contactando' THEN 'target_lead'
  -- ... mismo mapeo
  ELSE lead_status_crm
END;

-- 4. Actualizar collaborator_applications
UPDATE collaborator_applications SET lead_status_crm = CASE lead_status_crm
  WHEN 'contactando' THEN 'target_lead'
  -- ... mismo mapeo
  ELSE lead_status_crm
END;
```

### Fase 3: Actualización de Código

**Archivo 1: `src/components/admin/metrics/types.ts`**
```typescript
// Antes
export const TERMINAL_STATUS_KEYS = ['ganado', 'perdido', 'archivado', ...];
export const QUALIFIED_STATUS_KEYS = ['en_espera', 'fase0_activo', ...];

// Después
export const TERMINAL_STATUS_KEYS = ['ganado', 'perdido_nr', 'psh_enviada', ...];
export const QUALIFIED_STATUS_KEYS = ['contacto_efectivo', 'reunion_programada', ...];
```

**Archivo 2: `src/features/leads-pipeline/types/index.ts`**
```typescript
// Actualizar type LeadStatus
export type LeadStatus = 
  | 'nuevo'
  | 'target_lead'        // antes: contactando
  | 'unqualified_lead'   // antes: calificado
  | 'primer_contacto'    // antes: propuesta_enviada
  // ... etc
```

**Archivo 3: `src/components/admin/leads/LeadStatusBadge.tsx`**
```typescript
// Actualizar FALLBACK_CONFIG con nuevas claves
const FALLBACK_CONFIG = {
  nuevo: { label: 'Nuevo', ... },
  target_lead: { label: 'Target Lead', ... },
  unqualified_lead: { label: 'Unqualified Lead', ... },
  // ... etc
};
```

## Secuencia de Implementación

```text
┌─────────────────────────────────────────────────────────────┐
│  1. MIGRACIÓN SQL (ejecutar en producción)                  │
│     - Actualizar contact_statuses                           │
│     - Actualizar contact_leads                              │
│     - Actualizar company_valuations                         │
│     - Actualizar collaborator_applications                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. ACTUALIZAR CÓDIGO (deploy inmediatamente después)       │
│     - types.ts (constantes de métricas)                     │
│     - leads-pipeline/types/index.ts                         │
│     - LeadStatusBadge.tsx (fallback)                        │
│     - ContactsTable.tsx (configs)                           │
│     - Edge functions                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. VERIFICACIÓN                                            │
│     - Probar /admin/contacts                                │
│     - Probar /admin/pipeline                                │
│     - Probar métricas y dashboard                           │
└─────────────────────────────────────────────────────────────┘
```

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/metrics/types.ts` | Actualizar 6 constantes de agrupación |
| `src/features/leads-pipeline/types/index.ts` | Actualizar type LeadStatus y PIPELINE_COLUMNS |
| `src/components/admin/leads/LeadStatusBadge.tsx` | Actualizar FALLBACK_CONFIG (13 entries) |
| `src/components/admin/contacts/ContactsTable.tsx` | Actualizar configs (11 entries) |
| `supabase/functions/generate-rod-document/index.ts` | Verificar uso de 'nuevo' |

## Alternativa Recomendada

En lugar de migrar los `status_key`, considera **actualizar solo los labels en la base de datos** para que coincidan con los status_key existentes. Esto elimina:
- Riesgo de migración de datos
- Cambios en código
- Downtime potencial

Simplemente ejecutar:
```sql
UPDATE contact_statuses SET label = CASE status_key
  WHEN 'contactando' THEN 'Contactando'
  WHEN 'calificado' THEN 'Calificado'
  -- ... restaurar labels originales
END;
```

Esta opción es más segura pero requiere que el equipo adopte la nomenclatura original.
