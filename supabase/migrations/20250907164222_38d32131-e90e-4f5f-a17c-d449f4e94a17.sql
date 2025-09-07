-- Create market_reports table for admin management
CREATE TABLE public.market_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  pages INTEGER DEFAULT 1,
  file_url TEXT,
  cover_image_url TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.market_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage market reports" 
ON public.market_reports 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Anyone can view active market reports" 
ON public.market_reports 
FOR SELECT 
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_market_reports_updated_at
  BEFORE UPDATE ON public.market_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.market_reports (title, description, category, pages, last_updated) VALUES
('Análisis del Sector Tecnológico Q4 2024', 'Informe completo sobre tendencias M&A en el sector tecnológico español', 'Tecnología', 45, '2024-12-01'),
('Valoraciones en el Sector Retail', 'Múltiplos de valoración y análisis de transacciones en retail', 'Retail', 32, '2024-11-15'),
('Tendencias M&A en Energías Renovables', 'Panorama de fusiones y adquisiciones en el sector energético', 'Energía', 38, '2024-10-30');