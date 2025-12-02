-- Create email recipients configuration table
CREATE TABLE public.email_recipients_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'asesor', -- 'asesor', 'direccion', 'backoffice', 'administracion'
  is_default_copy BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments
COMMENT ON TABLE public.email_recipients_config IS 'Configuration for internal team email recipients';
COMMENT ON COLUMN public.email_recipients_config.role IS 'Team member role: asesor, direccion, backoffice, administracion';
COMMENT ON COLUMN public.email_recipients_config.is_default_copy IS 'Whether this recipient is included by default in email copies';

-- Enable RLS
ALTER TABLE public.email_recipients_config ENABLE ROW LEVEL SECURITY;

-- Admins can manage email recipients
CREATE POLICY "Admins can manage email recipients"
ON public.email_recipients_config
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_email_recipients_config_updated_at
BEFORE UPDATE ON public.email_recipients_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial team members
INSERT INTO public.email_recipients_config (email, name, role, is_default_copy) VALUES
  ('samuel@capittal.es', 'Samuel', 'direccion', true),
  ('pau@capittal.es', 'Pau', 'direccion', true),
  ('marcc@capittal.es', 'Marc C.', 'asesor', true),
  ('marc@capittal.es', 'Marc', 'asesor', true),
  ('lluis@capittal.es', 'Lluís', 'asesor', true),
  ('oriol@capittal.es', 'Oriol', 'asesor', true),
  ('valoraciones@capittal.es', 'Valoraciones', 'backoffice', true);