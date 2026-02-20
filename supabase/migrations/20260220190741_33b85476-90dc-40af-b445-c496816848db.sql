
-- =====================================================
-- FIX: Pérdida de contactos en mandato_contactos
-- Cambiar ON DELETE CASCADE → RESTRICT + audit log
-- =====================================================

-- PASO 1: Cambiar FK de CASCADE a RESTRICT para prevenir pérdida silenciosa
ALTER TABLE mandato_contactos
  DROP CONSTRAINT IF EXISTS mandato_contactos_contacto_id_fkey;

ALTER TABLE mandato_contactos
  ADD CONSTRAINT mandato_contactos_contacto_id_fkey
  FOREIGN KEY (contacto_id)
  REFERENCES contactos(id)
  ON DELETE RESTRICT;

-- PASO 2: Tabla de auditoría completa
CREATE TABLE IF NOT EXISTS mandato_contactos_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandato_contactos_id UUID,
  mandato_id UUID NOT NULL,
  contacto_id UUID NOT NULL,
  rol TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'DELETE', 'RESTORE')),
  performed_by UUID,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  deletion_reason TEXT,
  contacto_snapshot JSONB
);

CREATE INDEX IF NOT EXISTS idx_mc_audit_mandato_id ON mandato_contactos_audit_log(mandato_id);
CREATE INDEX IF NOT EXISTS idx_mc_audit_contacto_id ON mandato_contactos_audit_log(contacto_id);
CREATE INDEX IF NOT EXISTS idx_mc_audit_performed_at ON mandato_contactos_audit_log(performed_at DESC);

-- RLS
ALTER TABLE mandato_contactos_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON mandato_contactos_audit_log FOR SELECT
  TO authenticated
  USING (current_user_can_read());

CREATE POLICY "System can insert audit log"
  ON mandato_contactos_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- PASO 3: Función + trigger de auditoría en DELETE
CREATE OR REPLACE FUNCTION audit_mandato_contactos_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_contacto JSONB;
BEGIN
  SELECT to_jsonb(c) INTO v_contacto
  FROM contactos c WHERE c.id = OLD.contacto_id;

  INSERT INTO mandato_contactos_audit_log (
    mandato_contactos_id,
    mandato_id,
    contacto_id,
    rol,
    action,
    performed_by,
    deletion_reason,
    contacto_snapshot
  ) VALUES (
    OLD.id,
    OLD.mandato_id,
    OLD.contacto_id,
    OLD.rol,
    'DELETE',
    auth.uid(),
    'manual',
    v_contacto
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS audit_mandato_contactos_before_delete ON mandato_contactos;
CREATE TRIGGER audit_mandato_contactos_before_delete
BEFORE DELETE ON mandato_contactos
FOR EACH ROW
EXECUTE FUNCTION audit_mandato_contactos_delete();

-- PASO 4: Función + trigger de auditoría en INSERT
CREATE OR REPLACE FUNCTION audit_mandato_contactos_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO mandato_contactos_audit_log (
    mandato_contactos_id,
    mandato_id,
    contacto_id,
    rol,
    action,
    performed_by
  ) VALUES (
    NEW.id,
    NEW.mandato_id,
    NEW.contacto_id,
    NEW.rol,
    'INSERT',
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS audit_mandato_contactos_after_insert ON mandato_contactos;
CREATE TRIGGER audit_mandato_contactos_after_insert
AFTER INSERT ON mandato_contactos
FOR EACH ROW
EXECUTE FUNCTION audit_mandato_contactos_insert();

-- PASO 5: Fix merge_contactos para que no falle con RESTRICT
-- La función de merge debe borrar SOLO las filas duplicadas (ya migradas al target)
-- antes de borrar el source_id del contacto
CREATE OR REPLACE FUNCTION merge_contactos(p_source_id UUID, p_target_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Reasignar mandato_contactos del source al target (si no existe ya en target)
  UPDATE mandato_contactos
  SET contacto_id = p_target_id
  WHERE contacto_id = p_source_id
    AND mandato_id NOT IN (
      SELECT mandato_id FROM mandato_contactos WHERE contacto_id = p_target_id
    );

  -- Borrar filas duplicadas (mandatos donde AMBOS source y target estaban asignados)
  DELETE FROM mandato_contactos
  WHERE contacto_id = p_source_id
    AND mandato_id IN (
      SELECT mandato_id FROM mandato_contactos WHERE contacto_id = p_target_id
    );

  -- Reasignar empresa_principal_id si el source tiene una empresa
  UPDATE contactos
  SET empresa_principal_id = (SELECT empresa_principal_id FROM contactos WHERE id = p_source_id)
  WHERE id = p_target_id
    AND empresa_principal_id IS NULL
    AND (SELECT empresa_principal_id FROM contactos WHERE id = p_source_id) IS NOT NULL;

  -- Finalmente, eliminar el source
  DELETE FROM contactos WHERE id = p_source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
