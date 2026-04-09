
-- Add pipeline_type column
ALTER TABLE public.contact_statuses
ADD COLUMN pipeline_type TEXT NOT NULL DEFAULT 'sell'
CHECK (pipeline_type IN ('sell', 'buy'));

-- Drop old unique constraint on status_key and add composite unique
ALTER TABLE public.contact_statuses
DROP CONSTRAINT IF EXISTS contact_statuses_status_key_key;

ALTER TABLE public.contact_statuses
ADD CONSTRAINT contact_statuses_status_key_pipeline_type_key UNIQUE (status_key, pipeline_type);

-- Insert initial buy pipeline statuses
INSERT INTO public.contact_statuses (status_key, label, color, icon, position, is_visible, is_system, pipeline_type)
VALUES
  ('nuevo',        'Nuevo',           '#3B82F6', 'UserPlus',      0, true, true,  'buy'),
  ('contactando',  'Contactando',     '#F59E0B', 'Phone',         1, true, false, 'buy'),
  ('negociacion',  'En Negociación',  '#8B5CF6', 'Handshake',     2, true, false, 'buy'),
  ('ganado',       'Ganado',          '#10B981', 'CheckCircle',   3, true, true,  'buy'),
  ('perdido',      'Perdido',         '#EF4444', 'XCircle',       4, true, true,  'buy');
