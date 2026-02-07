
-- Create dealsuite_empresas table
CREATE TABLE public.dealsuite_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  descripcion TEXT,
  tipo_empresa TEXT,
  parte_de TEXT,
  experiencia_ma TEXT[] DEFAULT '{}',
  experiencia_sector TEXT[] DEFAULT '{}',
  tamano_proyectos_min NUMERIC,
  tamano_proyectos_max NUMERIC,
  enfoque_consultivo TEXT,
  sitio_web TEXT,
  imagen_url TEXT,
  notas TEXT,
  deal_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dealsuite_empresas ENABLE ROW LEVEL SECURITY;

-- RLS policy for admins
CREATE POLICY "Admins can manage dealsuite_empresas"
  ON public.dealsuite_empresas
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Extend dealsuite_contacts with new columns
ALTER TABLE public.dealsuite_contacts
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.dealsuite_empresas(id),
  ADD COLUMN IF NOT EXISTS cargo TEXT,
  ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- Make email nullable (allow contacts without email)
ALTER TABLE public.dealsuite_contacts
  ALTER COLUMN email DROP NOT NULL;

-- Drop unique constraint on email to allow multiple contacts without email
ALTER TABLE public.dealsuite_contacts
  DROP CONSTRAINT IF EXISTS dealsuite_contacts_email_key;

-- Create a partial unique index (unique email only when not null)
CREATE UNIQUE INDEX IF NOT EXISTS dealsuite_contacts_email_unique
  ON public.dealsuite_contacts (email)
  WHERE email IS NOT NULL;

-- Trigger for updated_at on dealsuite_empresas
CREATE TRIGGER update_dealsuite_empresas_updated_at
  BEFORE UPDATE ON public.dealsuite_empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
