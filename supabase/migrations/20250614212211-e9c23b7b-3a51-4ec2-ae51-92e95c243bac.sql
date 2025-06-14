
-- Primero agregar la columna employee_range
ALTER TABLE public.sector_multiples 
ADD COLUMN employee_range VARCHAR(20);

-- Modificar la constraint unique para incluir employee_range
ALTER TABLE public.sector_multiples 
DROP CONSTRAINT IF EXISTS sector_multiples_sector_name_key;

ALTER TABLE public.sector_multiples 
ADD CONSTRAINT sector_multiples_sector_employee_unique 
UNIQUE (sector_name, employee_range);
