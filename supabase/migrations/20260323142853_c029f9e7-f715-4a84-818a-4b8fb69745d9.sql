
-- Tabla de etapas configurables para pipeline outbound
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

-- Seed con etapas actuales + nuevas sugeridas
INSERT INTO outbound_pipeline_stages (stage_key, label, color, icon, position, is_system) VALUES
  ('sin_respuesta', 'Sin respuesta', '#6b7280', 'HelpCircle', 0, true),
  ('interesado', 'Interesado', '#2563eb', 'ThumbsUp', 1, true),
  ('reunion_agendada', 'Reunión agendada', '#7c3aed', 'CalendarCheck', 2, true),
  ('no_interesado', 'No interesado', '#ef4444', 'XCircle', 3, true),
  ('propuesta_enviada', 'Propuesta enviada', '#f59e0b', 'Send', 4, false),
  ('negociacion', 'Negociación', '#8b5cf6', 'Handshake', 5, false),
  ('cerrado_ganado', 'Cerrado ganado', '#10b981', 'Trophy', 6, false),
  ('cerrado_perdido', 'Cerrado perdido', '#dc2626', 'Ban', 7, false);

-- Quitar el CHECK constraint para permitir más valores de seguimiento
ALTER TABLE valuation_campaign_companies DROP CONSTRAINT IF EXISTS chk_seguimiento_estado;

-- RLS
ALTER TABLE outbound_pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON outbound_pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write" ON outbound_pipeline_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);
