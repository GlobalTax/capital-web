-- Add new fields to company_operations for enhanced cards
ALTER TABLE public.company_operations 
ADD COLUMN IF NOT EXISTS ebitda_multiple numeric,
ADD COLUMN IF NOT EXISTS growth_percentage numeric,
ADD COLUMN IF NOT EXISTS revenue_amount numeric,
ADD COLUMN IF NOT EXISTS ebitda_amount numeric,
ADD COLUMN IF NOT EXISTS company_size_employees text,
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS highlights text[],
ADD COLUMN IF NOT EXISTS status text DEFAULT 'available',
ADD COLUMN IF NOT EXISTS deal_type text DEFAULT 'sale';

-- Update existing records with estimated values
UPDATE public.company_operations 
SET 
  ebitda_multiple = CASE 
    WHEN sector = 'Tecnología' THEN 8.5
    WHEN sector = 'Salud' THEN 7.2
    WHEN sector = 'Servicios' THEN 6.8
    WHEN sector = 'Industrial' THEN 5.5
    WHEN sector = 'Retail' THEN 4.2
    ELSE 6.0
  END,
  growth_percentage = CASE 
    WHEN is_featured = true THEN 15.5
    ELSE 8.2
  END,
  company_size_employees = CASE 
    WHEN valuation_amount > 5000000 THEN '50-100'
    WHEN valuation_amount > 2000000 THEN '20-50'
    WHEN valuation_amount > 500000 THEN '10-20'
    ELSE '5-10'
  END,
  short_description = LEFT(description, 120),
  highlights = CASE 
    WHEN is_featured = true THEN ARRAY['Líder del sector', 'Crecimiento sostenido', 'Equipo consolidado']
    ELSE ARRAY['Oportunidad única', 'Rentabilidad probada']
  END,
  status = 'available',
  deal_type = CASE 
    WHEN random() > 0.7 THEN 'acquisition'
    ELSE 'sale'
  END
WHERE ebitda_multiple IS NULL;