-- 1. Crear tabla contact_statuses
CREATE TABLE IF NOT EXISTS public.contact_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'gray',
  icon TEXT DEFAULT '📋',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.contact_statuses ENABLE ROW LEVEL SECURITY;

-- 3. Policy lectura para autenticados
CREATE POLICY "Authenticated can read statuses"
ON public.contact_statuses FOR SELECT TO authenticated USING (true);

-- 4. Policy escritura solo para admins
CREATE POLICY "Admins can manage statuses"
ON public.contact_statuses FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Insertar estados iniciales basados en ENUM actual
INSERT INTO public.contact_statuses (status_key, label, color, icon, position, is_system) VALUES
('nuevo', 'Nuevo', 'blue', '📥', 1, true),
('contactando', 'Contactando', 'purple', '📞', 2, false),
('calificado', 'Calificado', 'cyan', '✅', 3, false),
('propuesta_enviada', 'Propuesta Enviada', 'indigo', '📄', 4, false),
('negociacion', 'Negociación', 'orange', '🤝', 5, false),
('en_espera', 'En Espera', 'yellow', '⏸️', 6, false),
('ganado', 'Ganado', 'green', '🏆', 7, true),
('perdido', 'Perdido', 'red', '❌', 8, true),
('archivado', 'Archivado', 'gray', '📦', 9, false),
('fase0_activo', 'Fase 0 Activo', 'emerald', '🚀', 10, false),
('fase0_bloqueado', 'Fase 0 Bloqueado', 'slate', '🔒', 11, false),
('mandato_propuesto', 'Mandato Propuesto', 'amber', '📋', 12, false),
('mandato_firmado', 'Mandato Firmado', 'teal', '✍️', 13, false)
ON CONFLICT (status_key) DO NOTHING;

-- 6. Índice para ordenación
CREATE INDEX IF NOT EXISTS idx_contact_statuses_position ON public.contact_statuses(position);