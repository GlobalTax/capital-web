-- Create buy_side_mandates table for companies being searched
CREATE TABLE public.buy_side_mandates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sector TEXT NOT NULL,
  subsector TEXT,
  geographic_scope TEXT NOT NULL,
  revenue_min NUMERIC,
  revenue_max NUMERIC,
  ebitda_min NUMERIC,
  ebitda_max NUMERIC,
  description TEXT,
  requirements TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.buy_side_mandates ENABLE ROW LEVEL SECURITY;

-- RLS policies for admins
CREATE POLICY "Admins can view buy_side_mandates"
ON public.buy_side_mandates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admins can insert buy_side_mandates"
ON public.buy_side_mandates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admins can update buy_side_mandates"
ON public.buy_side_mandates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admins can delete buy_side_mandates"
ON public.buy_side_mandates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_buy_side_mandates_updated_at
BEFORE UPDATE ON public.buy_side_mandates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add buy_side_mandates_included column to newsletter_campaigns
ALTER TABLE public.newsletter_campaigns 
ADD COLUMN IF NOT EXISTS buy_side_mandates_included UUID[] DEFAULT '{}';

-- Insert sample data
INSERT INTO public.buy_side_mandates (title, sector, geographic_scope, revenue_min, revenue_max, description, is_new)
VALUES 
  ('Adquisición estratégica en la tecnología dental europea', 'Tecnología Dental', 'Europa', 2000000, 150000000, 'Buscamos empresas de tecnología dental con posición de mercado establecida', true),
  ('Adquisición de Corredores de Seguros Corporativos', 'Seguros', 'Francia', 1000000, 20000000, 'Interés en corredores de seguros corporativos con cartera diversificada', true);