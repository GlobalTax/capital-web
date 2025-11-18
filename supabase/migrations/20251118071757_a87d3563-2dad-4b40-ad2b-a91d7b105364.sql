-- Sprint 1: Sistema de Asignación + Historial de Cambios + Búsqueda Avanzada

-- 1. SISTEMA DE ASIGNACIÓN: Añadir campos a company_operations
ALTER TABLE company_operations 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES admin_users(user_id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES admin_users(user_id);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_operations_assigned_to ON company_operations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_operations_assigned_at ON company_operations(assigned_at);

-- 2. HISTORIAL DE CAMBIOS: Crear tabla operation_history
CREATE TABLE IF NOT EXISTS operation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL REFERENCES company_operations(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES admin_users(user_id),
  field_changed TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  change_type TEXT NOT NULL CHECK (change_type IN ('update', 'create', 'status_change', 'assignment', 'delete')),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para operation_history
CREATE INDEX IF NOT EXISTS idx_operation_history_operation ON operation_history(operation_id);
CREATE INDEX IF NOT EXISTS idx_operation_history_changed_by ON operation_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_operation_history_changed_at ON operation_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_operation_history_change_type ON operation_history(change_type);

-- RLS para operation_history
ALTER TABLE operation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view operation history"
ON operation_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "System can insert operation history"
ON operation_history FOR INSERT
WITH CHECK (true);

-- 3. BÚSQUEDAS GUARDADAS: Crear tabla saved_searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(user_id),
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para saved_searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_shared ON saved_searches(is_shared);

-- RLS para saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own and shared searches"
ON saved_searches FOR SELECT
USING (
  user_id = (SELECT user_id FROM admin_users WHERE user_id = auth.uid())
  OR is_shared = true
);

CREATE POLICY "Users can manage their own searches"
ON saved_searches FOR ALL
USING (
  user_id = (SELECT user_id FROM admin_users WHERE user_id = auth.uid())
);

-- 4. FUNCIÓN TRIGGER para auto-capturar cambios en company_operations
CREATE OR REPLACE FUNCTION log_operation_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[];
  field_name TEXT;
  old_val JSONB;
  new_val JSONB;
  change_type_val TEXT;
BEGIN
  -- Determinar tipo de cambio
  IF TG_OP = 'INSERT' THEN
    change_type_val := 'create';
    
    INSERT INTO operation_history (
      operation_id,
      changed_by,
      field_changed,
      old_value,
      new_value,
      change_type
    ) VALUES (
      NEW.id,
      (SELECT user_id FROM admin_users WHERE user_id = auth.uid() LIMIT 1),
      'created',
      NULL,
      to_jsonb(NEW),
      change_type_val
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar si es cambio de estado
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO operation_history (
        operation_id,
        changed_by,
        field_changed,
        old_value,
        new_value,
        change_type
      ) VALUES (
        NEW.id,
        (SELECT user_id FROM admin_users WHERE user_id = auth.uid() LIMIT 1),
        'status',
        to_jsonb(OLD.status),
        to_jsonb(NEW.status),
        'status_change'
      );
    END IF;
    
    -- Detectar si es cambio de asignación
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO operation_history (
        operation_id,
        changed_by,
        field_changed,
        old_value,
        new_value,
        change_type
      ) VALUES (
        NEW.id,
        (SELECT user_id FROM admin_users WHERE user_id = auth.uid() LIMIT 1),
        'assigned_to',
        to_jsonb(OLD.assigned_to),
        to_jsonb(NEW.assigned_to),
        'assignment'
      );
    END IF;
    
    -- Registrar otros cambios importantes
    IF OLD.valuation_amount IS DISTINCT FROM NEW.valuation_amount THEN
      INSERT INTO operation_history (
        operation_id,
        changed_by,
        field_changed,
        old_value,
        new_value,
        change_type
      ) VALUES (
        NEW.id,
        (SELECT user_id FROM admin_users WHERE user_id = auth.uid() LIMIT 1),
        'valuation_amount',
        to_jsonb(OLD.valuation_amount),
        to_jsonb(NEW.valuation_amount),
        'update'
      );
    END IF;
    
    IF OLD.company_name IS DISTINCT FROM NEW.company_name THEN
      INSERT INTO operation_history (
        operation_id,
        changed_by,
        field_changed,
        old_value,
        new_value,
        change_type
      ) VALUES (
        NEW.id,
        (SELECT user_id FROM admin_users WHERE user_id = auth.uid() LIMIT 1),
        'company_name',
        to_jsonb(OLD.company_name),
        to_jsonb(NEW.company_name),
        'update'
      );
    END IF;
    
    IF OLD.sector IS DISTINCT FROM NEW.sector THEN
      INSERT INTO operation_history (
        operation_id,
        changed_by,
        field_changed,
        old_value,
        new_value,
        change_type
      ) VALUES (
        NEW.id,
        (SELECT user_id FROM admin_users WHERE user_id = auth.uid() LIMIT 1),
        'sector',
        to_jsonb(OLD.sector),
        to_jsonb(NEW.sector),
        'update'
      );
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO operation_history (
      operation_id,
      changed_by,
      field_changed,
      old_value,
      new_value,
      change_type
    ) VALUES (
      OLD.id,
      (SELECT user_id FROM admin_users WHERE user_id = auth.uid() LIMIT 1),
      'deleted',
      to_jsonb(OLD),
      NULL,
      'delete'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS operation_audit_trigger ON company_operations;
CREATE TRIGGER operation_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON company_operations
FOR EACH ROW
EXECUTE FUNCTION log_operation_changes();

-- Comentarios para documentación
COMMENT ON TABLE operation_history IS 'Historial completo de cambios en operaciones para auditoría';
COMMENT ON TABLE saved_searches IS 'Búsquedas guardadas por usuarios para reutilización rápida';
COMMENT ON COLUMN company_operations.assigned_to IS 'Usuario asignado a la operación';
COMMENT ON COLUMN company_operations.assigned_at IS 'Fecha de asignación';
COMMENT ON COLUMN company_operations.assigned_by IS 'Usuario que realizó la asignación';