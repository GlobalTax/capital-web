-- ===== SPRINT 2: SISTEMA DE NOTAS Y COMENTARIOS =====

-- Tabla de notas para operaciones con threading
CREATE TABLE IF NOT EXISTS operation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID REFERENCES company_operations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_text TEXT NOT NULL CHECK (char_length(note_text) <= 5000),
  note_html TEXT,
  is_internal BOOLEAN DEFAULT true,
  parent_note_id UUID REFERENCES operation_notes(id) ON DELETE CASCADE,
  mentions JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_operation_notes_operation ON operation_notes(operation_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_operation_notes_user ON operation_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_notes_parent ON operation_notes(parent_note_id);
CREATE INDEX IF NOT EXISTS idx_operation_notes_created ON operation_notes(created_at DESC);

-- Tabla de notificaciones de menciones
CREATE TABLE IF NOT EXISTS note_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES operation_notes(id) ON DELETE CASCADE,
  mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(note_id, mentioned_user_id)
);

CREATE INDEX IF NOT EXISTS idx_note_mentions_user ON note_mentions(mentioned_user_id, is_read);

-- Trigger para crear notificaciones de menciones
CREATE OR REPLACE FUNCTION create_mention_notifications()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user UUID;
BEGIN
  IF NEW.mentions IS NOT NULL AND jsonb_array_length(NEW.mentions) > 0 THEN
    FOR mentioned_user IN 
      SELECT (jsonb_array_elements_text(NEW.mentions))::UUID
    LOOP
      IF mentioned_user != NEW.user_id THEN
        INSERT INTO note_mentions (note_id, mentioned_user_id)
        VALUES (NEW.id, mentioned_user)
        ON CONFLICT (note_id, mentioned_user_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS note_mentions_trigger ON operation_notes;
CREATE TRIGGER note_mentions_trigger
AFTER INSERT ON operation_notes
FOR EACH ROW
EXECUTE FUNCTION create_mention_notifications();

-- RLS Policies para operation_notes
ALTER TABLE operation_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all notes" ON operation_notes;
CREATE POLICY "Admins can view all notes"
ON operation_notes FOR SELECT
USING (current_user_is_admin());

DROP POLICY IF EXISTS "Users can create notes" ON operation_notes;
CREATE POLICY "Users can create notes"
ON operation_notes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  current_user_is_admin()
);

DROP POLICY IF EXISTS "Users can update own notes" ON operation_notes;
CREATE POLICY "Users can update own notes"
ON operation_notes FOR UPDATE
USING (auth.uid() = user_id AND current_user_is_admin());

DROP POLICY IF EXISTS "Admins can delete notes" ON operation_notes;
CREATE POLICY "Admins can delete notes"
ON operation_notes FOR DELETE
USING (current_user_is_admin());

-- RLS Policies para note_mentions
ALTER TABLE note_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their mentions" ON note_mentions;
CREATE POLICY "Users can view their mentions"
ON note_mentions FOR SELECT
USING (auth.uid() = mentioned_user_id);

DROP POLICY IF EXISTS "Users can update their mentions" ON note_mentions;
CREATE POLICY "Users can update their mentions"
ON note_mentions FOR UPDATE
USING (auth.uid() = mentioned_user_id);

-- ===== INTEGRACIÓN CRM: VINCULAR LEADS CON OPERACIONES =====

-- Añadir campos de origen a company_operations
ALTER TABLE company_operations
ADD COLUMN IF NOT EXISTS source_lead_id UUID,
ADD COLUMN IF NOT EXISTS source_lead_type TEXT CHECK (source_lead_type IN ('contact', 'valuation', 'acquisition', 'collaborator', 'accountex'));

CREATE INDEX IF NOT EXISTS idx_operations_source_lead ON company_operations(source_lead_id) WHERE source_lead_id IS NOT NULL;

-- Tabla para tracking de conversiones Lead → Operación
CREATE TABLE IF NOT EXISTS lead_to_operation_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('contact', 'valuation', 'acquisition', 'collaborator', 'accountex')),
  operation_id UUID REFERENCES company_operations(id) ON DELETE SET NULL,
  converted_by UUID REFERENCES auth.users(id),
  converted_at TIMESTAMPTZ DEFAULT now(),
  conversion_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_conversions_lead ON lead_to_operation_conversions(lead_id, lead_type);
CREATE INDEX IF NOT EXISTS idx_conversions_operation ON lead_to_operation_conversions(operation_id);

-- RLS Policies para conversiones
ALTER TABLE lead_to_operation_conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view conversions" ON lead_to_operation_conversions;
CREATE POLICY "Admins can view conversions"
ON lead_to_operation_conversions FOR SELECT
USING (current_user_is_admin());

DROP POLICY IF EXISTS "Admins can create conversions" ON lead_to_operation_conversions;
CREATE POLICY "Admins can create conversions"
ON lead_to_operation_conversions FOR INSERT
WITH CHECK (current_user_is_admin());

-- Trigger para actualizar updated_at en operation_notes
CREATE OR REPLACE FUNCTION update_operation_notes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_operation_notes_timestamp_trigger ON operation_notes;
CREATE TRIGGER update_operation_notes_timestamp_trigger
BEFORE UPDATE ON operation_notes
FOR EACH ROW
EXECUTE FUNCTION update_operation_notes_timestamp();