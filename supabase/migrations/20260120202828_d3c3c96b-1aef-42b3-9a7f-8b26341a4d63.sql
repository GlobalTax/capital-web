-- =============================================
-- DIRECTORIO CONTACTOS COMPRA - Tablas
-- =============================================

-- 1. Tabla principal de contactos de campaña compras
CREATE TABLE buyer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos del contacto
  first_name TEXT NOT NULL,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
  ) STORED,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  
  -- Origen (fijo para esta tabla)
  origin TEXT DEFAULT 'campana_compras' NOT NULL,
  campaign_name TEXT DEFAULT 'Campaña Compras',
  
  -- Metadatos de importación
  import_batch_id UUID,
  import_filename TEXT,
  imported_at TIMESTAMP WITH TIME ZONE,
  imported_by UUID,
  
  -- Notas y gestión
  internal_notes TEXT,
  status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'calificado', 'descartado')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint único por email para evitar duplicados
  CONSTRAINT buyer_contacts_email_unique UNIQUE (email)
);

-- 2. Tabla de historial de importaciones
CREATE TABLE buyer_contact_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  filename TEXT NOT NULL,
  total_rows INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  duplicate_emails INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_log JSONB DEFAULT '[]'::jsonb,
  
  imported_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_buyer_contacts_email ON buyer_contacts(email);
CREATE INDEX idx_buyer_contacts_import_batch ON buyer_contacts(import_batch_id);
CREATE INDEX idx_buyer_contacts_status ON buyer_contacts(status);
CREATE INDEX idx_buyer_contacts_created_at ON buyer_contacts(created_at DESC);
CREATE INDEX idx_buyer_contacts_company ON buyer_contacts(company);
CREATE INDEX idx_buyer_contact_imports_status ON buyer_contact_imports(status);

-- RLS
ALTER TABLE buyer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_contact_imports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admins
CREATE POLICY "Admins can manage buyer_contacts"
ON buyer_contacts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage buyer_contact_imports"
ON buyer_contact_imports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_buyer_contacts_updated_at
  BEFORE UPDATE ON buyer_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();