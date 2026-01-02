-- Add new lead statuses to the enum for Fase 0 workflow
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'fase0_activo';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'fase0_bloqueado';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'mandato_propuesto';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'mandato_firmado';

-- Add previous_version_id column for document versioning
ALTER TABLE fase0_documents 
ADD COLUMN IF NOT EXISTS previous_version_id UUID REFERENCES fase0_documents(id),
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sent_to_email TEXT,
ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS signed_by TEXT,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Create workflow rules table
CREATE TABLE IF NOT EXISTS fase0_workflow_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('block_status', 'require_document', 'auto_suggest')),
  condition JSONB NOT NULL DEFAULT '{}',
  action JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on workflow rules
ALTER TABLE fase0_workflow_rules ENABLE ROW LEVEL SECURITY;

-- Admins can manage workflow rules
CREATE POLICY "Admin users can manage workflow rules" ON fase0_workflow_rules
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Insert default workflow rules
INSERT INTO fase0_workflow_rules (rule_name, rule_type, condition, action, description, display_order) VALUES
(
  'nda_before_propuesta',
  'block_status',
  '{"required_document": "nda", "required_status": "signed"}',
  '{"blocked_lead_status": "propuesta_enviada", "message": "El NDA debe estar firmado antes de enviar la propuesta de mandato"}',
  'Requiere NDA firmado antes de poder enviar propuesta de mandato',
  1
),
(
  'nda_before_mandato',
  'block_status',
  '{"required_document": "nda", "required_status": "signed"}',
  '{"blocked_lead_status": "mandato_propuesto", "message": "El NDA debe estar firmado antes de proponer el mandato"}',
  'Requiere NDA firmado antes de proponer mandato',
  2
),
(
  'suggest_venta_for_sellside',
  'auto_suggest',
  '{"lead_type": "sell-side"}',
  '{"suggested_document": "propuesta_mandato_venta", "highlight": true}',
  'Sugiere propuesta de mandato de venta para leads sell-side',
  3
),
(
  'suggest_compra_for_buyside',
  'auto_suggest',
  '{"lead_type": "buy-side"}',
  '{"suggested_document": "propuesta_mandato_compra", "highlight": true}',
  'Sugiere propuesta de mandato de compra para leads buy-side',
  4
)
ON CONFLICT (rule_name) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_fase0_workflow_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_fase0_workflow_rules_timestamp ON fase0_workflow_rules;
CREATE TRIGGER update_fase0_workflow_rules_timestamp
  BEFORE UPDATE ON fase0_workflow_rules
  FOR EACH ROW EXECUTE FUNCTION update_fase0_workflow_rules_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fase0_documents_lead_type_status 
  ON fase0_documents(lead_id, lead_type, document_type, status);

CREATE INDEX IF NOT EXISTS idx_fase0_workflow_rules_active 
  ON fase0_workflow_rules(is_active, rule_type);