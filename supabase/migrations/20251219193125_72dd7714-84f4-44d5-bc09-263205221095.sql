-- Create reengagement_templates table for dynamic email templates
CREATE TABLE public.reengagement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  brevo_segment TEXT NOT NULL,
  trigger_condition TEXT NOT NULL,
  default_subject TEXT NOT NULL,
  html_template TEXT NOT NULL,
  icon TEXT DEFAULT 'mail',
  variables_used TEXT[] DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.reengagement_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active templates
CREATE POLICY "Anyone can view active templates"
ON public.reengagement_templates
FOR SELECT
USING (is_active = true);

-- Admins can manage all templates
CREATE POLICY "Admins can manage templates"
ON public.reengagement_templates
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_reengagement_templates_updated_at
  BEFORE UPDATE ON public.reengagement_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_general_contact_leads();

-- Insert the 5 system templates
INSERT INTO public.reengagement_templates (slug, label, description, brevo_segment, trigger_condition, default_subject, html_template, icon, variables_used, is_system) VALUES
('abandoned', 'Valoración Abandonada', 'Leads que empezaron pero no completaron la valoración', 'valuation_status = "started"', '24-48h después de abandono', '{{contact.FIRSTNAME}}, tu valoración está esperando', '', 'clock', ARRAY['FIRSTNAME', 'COMPANY', 'SECTOR'], true),
('reactivation', 'Reactivación Suave', 'Leads inactivos 30+ días', 'last_activity > 30 días', '30 días sin actividad', '¿Sigues pensando en vender {{contact.COMPANY}}?', '', 'refresh-cw', ARRAY['FIRSTNAME', 'COMPANY', 'SECTOR'], true),
('value_added', 'Valor Añadido', 'Información de valor sobre su sector', 'completed_valuation = true', '45-60 días post-valoración', 'Múltiplos actualizados para {{contact.SECTOR}}', '', 'trending-up', ARRAY['FIRSTNAME', 'COMPANY', 'SECTOR', 'VALUATION'], true),
('revaluation', 'Re-valorización', 'Invitación a actualizar valoración (6+ meses)', 'valuation_date < 6 meses', '6 meses desde última valoración', '{{contact.FIRSTNAME}}, ¿ha cambiado el valor de {{contact.COMPANY}}?', '', 'calendar', ARRAY['FIRSTNAME', 'COMPANY', 'VALUATION'], true),
('nurturing', 'Nurturing Mensual', 'Contenido periódico de valor', 'is_active = true', 'Mensual', 'Novedades del mercado M&A – {{current_month}}', '', 'mail', ARRAY['FIRSTNAME', 'COMPANY', 'SECTOR'], true);