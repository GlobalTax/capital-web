-- Create booking_config table for parametrizable meeting types and formats
CREATE TABLE public.booking_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL CHECK (config_type IN ('meeting_type', 'meeting_format', 'time_slot')),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(config_type, value)
);

-- Enable RLS
ALTER TABLE public.booking_config ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active config
CREATE POLICY "Anyone can read active booking config"
ON public.booking_config
FOR SELECT
USING (is_active = true);

-- Policy: Only admins can manage config
CREATE POLICY "Admins can manage booking config"
ON public.booking_config
FOR ALL
USING (public.is_user_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_booking_config_updated_at
  BEFORE UPDATE ON public.booking_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_general_contact_leads();

-- Insert default meeting types
INSERT INTO public.booking_config (config_type, value, label, display_order) VALUES
  ('meeting_type', 'initial_consultation', 'Consulta Inicial', 1),
  ('meeting_type', 'follow_up', 'Seguimiento', 2),
  ('meeting_type', 'valuation_review', 'Revisión de Valoración', 3),
  ('meeting_type', 'due_diligence', 'Due Diligence', 4),
  ('meeting_type', 'closing', 'Cierre', 5),
  ('meeting_type', 'other', 'Otro', 6);

-- Insert default meeting formats
INSERT INTO public.booking_config (config_type, value, label, display_order) VALUES
  ('meeting_format', 'video_call', 'Videollamada', 1),
  ('meeting_format', 'phone_call', 'Llamada telefónica', 2),
  ('meeting_format', 'in_person', 'Presencial', 3);