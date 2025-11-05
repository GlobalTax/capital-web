-- Agregar política RLS para permitir inserts anónimos en advisor_valuations
-- con validaciones básicas de seguridad

CREATE POLICY "Allow anonymous insert advisor valuations"
ON advisor_valuations
FOR INSERT
TO anon
WITH CHECK (
  -- Validar que los campos obligatorios existen
  email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND contact_name IS NOT NULL 
  AND length(TRIM(contact_name)) >= 2
  AND length(TRIM(contact_name)) <= 100
  AND company_name IS NOT NULL
  AND length(TRIM(company_name)) >= 2
  AND length(TRIM(company_name)) <= 100
  AND cif IS NOT NULL
  AND firm_type IS NOT NULL
  AND employee_range IS NOT NULL
  AND revenue > 0
  AND ebitda > 0
);