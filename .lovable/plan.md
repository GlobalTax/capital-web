

## Pipeline visual en Resumen General de Campañas Outbound

### Concepto
Añadir una sección de pipeline Kanban horizontal en el dashboard de Resumen General que muestre las empresas agrupadas por su estado de seguimiento. Las etapas serán configurables: las 4 actuales (sin respuesta, interesado, reunión agendada, no interesado) + nuevas etapas personalizables (ej: propuesta enviada, due diligence, cerrado ganado, cerrado perdido).

### Cambios

**1. Migración: tabla `outbound_pipeline_stages` + eliminar constraint**

```sql
-- Tabla de etapas configurables
CREATE TABLE outbound_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT NOT NULL DEFAULT 'Circle',
  position INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed con las 4 etapas actuales + nuevas sugeridas
INSERT INTO outbound_pipeline_stages (stage_key, label, color, icon, position, is_system) VALUES
  ('sin_respuesta', 'Sin respuesta', '#6b7280', 'HelpCircle', 0, true),
  ('interesado', 'Interesado', '#2563eb', 'ThumbsUp', 1, true),
  ('reunion_agendada', 'Reunión agendada', '#7c3aed', 'CalendarCheck', 2, true),
  ('no_interesado', 'No interesado', '#ef4444', 'XCircle', 3, true),
  ('propuesta_enviada', 'Propuesta enviada', '#f59e0b', 'Send', 4, false),
  ('negociacion', 'Negociación', '#8b5cf6', 'Handshake', 5, false),
  ('cerrado_ganado', 'Cerrado ganado', '#10b981', 'Trophy', 6, false),
  ('cerrado_perdido', 'Cerrado perdido', '#dc2626', 'Ban', 7, false);

-- Quitar el CHECK constraint para permitir más valores
ALTER TABLE valuation_campaign_companies DROP CONSTRAINT IF EXISTS chk_seguimiento_estado;

-- RLS
ALTER TABLE outbound_pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON outbound_pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write" ON outbound_pipeline_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

**2. Hook: `src/hooks/useOutboundPipelineStages.ts`**
- CRUD para las etapas: listar, crear, actualizar, eliminar, reordenar
- Similar a `useContactStatuses`

**3. Componente: `src/components/admin/campanas-valoracion/OutboundPipelineSection.tsx`**
- Pipeline Kanban horizontal con columnas por etapa
- Cada columna muestra: nombre de etapa, contador, lista de empresas (nombre + campaña)
- Drag & drop para mover empresas entre etapas (actualiza `seguimiento_estado`)
- Respeta los filtros de campaña y fecha del dashboard padre

**4. Editor de etapas: `src/components/admin/campanas-valoracion/OutboundStagesEditor.tsx`**
- Botón "Gestionar etapas" que abre un diálogo
- Permite añadir nuevas etapas, reordenar, activar/desactivar
- Las 4 etapas de sistema no se pueden eliminar

**5. Integrar en `OutboundSummaryDashboard.tsx`**
- Añadir la sección de pipeline entre el funnel actual y la tabla de desglose
- Pasar los filtros activos (campañas habilitadas, rango de fechas) al componente pipeline
- Añadir botón de gestión de etapas en el header

**6. Actualizar `SEGUIMIENTO_OPTIONS` en los 3 archivos de steps**
- Cargar las opciones dinámicamente desde `outbound_pipeline_stages` en vez de tenerlas hardcodeadas
- Así al añadir nuevas etapas aparecen automáticamente en los selectores

### Resultado
El Resumen General tendrá un pipeline visual donde se ven todas las empresas contactadas organizadas por fase. Se podrán arrastrar entre columnas y añadir nuevas fases según evolucione el proceso comercial.

