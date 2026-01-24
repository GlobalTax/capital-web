-- Create table for lead pipeline column configuration
CREATE TABLE public.lead_pipeline_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-gray-500',
  icon TEXT NOT NULL DEFAULT '📋',
  position INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_pipeline_columns ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can read all columns
CREATE POLICY "Admin users can read pipeline columns"
ON public.lead_pipeline_columns
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Policy: Admin users can insert columns
CREATE POLICY "Admin users can insert pipeline columns"
ON public.lead_pipeline_columns
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Policy: Admin users can update columns
CREATE POLICY "Admin users can update pipeline columns"
ON public.lead_pipeline_columns
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Policy: Admin users can delete non-system columns
CREATE POLICY "Admin users can delete non-system pipeline columns"
ON public.lead_pipeline_columns
FOR DELETE
USING (
  is_system = false
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Insert default columns from current hardcoded values
INSERT INTO public.lead_pipeline_columns (stage_key, label, color, icon, position, is_system) VALUES
  ('nuevo', 'Nuevos', 'bg-blue-500', '📥', 1, true),
  ('contactando', 'Contactando', 'bg-yellow-500', '📞', 2, false),
  ('calificado', 'Calificados', 'bg-green-500', '✅', 3, false),
  ('fase0_activo', 'Pre-Mandato', 'bg-orange-500', '📋', 4, false),
  ('fase0_bloqueado', 'Bloqueado (NDA)', 'bg-red-400', '🔒', 5, false),
  ('propuesta_enviada', 'Propuesta Enviada', 'bg-purple-500', '📄', 6, false),
  ('mandato_propuesto', 'Mandato Propuesto', 'bg-indigo-500', '📝', 7, false),
  ('negociacion', 'Negociación', 'bg-orange-500', '🤝', 8, false),
  ('mandato_firmado', 'Mandato Firmado', 'bg-emerald-500', '✍️', 9, false),
  ('en_espera', 'En Espera', 'bg-gray-500', '⏸️', 10, false),
  ('ganado', 'Ganados', 'bg-emerald-600', '🏆', 11, true),
  ('perdido', 'Perdidos', 'bg-red-500', '❌', 12, true),
  ('archivado', 'Archivados', 'bg-slate-400', '📦', 13, false);

-- Create trigger to update updated_at
CREATE TRIGGER update_lead_pipeline_columns_updated_at
BEFORE UPDATE ON public.lead_pipeline_columns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();