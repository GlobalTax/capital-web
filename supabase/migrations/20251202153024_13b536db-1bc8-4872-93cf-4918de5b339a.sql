-- Create table for PDF signature configuration
CREATE TABLE public.pdf_signature_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'Equipo Capittal',
  role TEXT NOT NULL DEFAULT 'Consultor de M&A',
  email TEXT NOT NULL DEFAULT 'info@capittal.es',
  phone TEXT NOT NULL DEFAULT '+34 XXX XXX XXX',
  website TEXT NOT NULL DEFAULT 'www.capittal.es',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pdf_signature_config ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view pdf signature config" 
ON public.pdf_signature_config 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admins can update pdf signature config" 
ON public.pdf_signature_config 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admins can insert pdf signature config" 
ON public.pdf_signature_config 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Insert default config
INSERT INTO public.pdf_signature_config (config_key, name, role, email, phone, website)
VALUES ('default', 'Equipo Capittal', 'Consultor de M&A', 'info@capittal.es', '+34 XXX XXX XXX', 'www.capittal.es');

-- Create trigger for updated_at
CREATE TRIGGER update_pdf_signature_config_updated_at
BEFORE UPDATE ON public.pdf_signature_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();