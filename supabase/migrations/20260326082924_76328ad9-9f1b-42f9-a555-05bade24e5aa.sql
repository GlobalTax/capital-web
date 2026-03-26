ALTER TABLE company_operations ADD COLUMN IF NOT EXISTS project_name TEXT;

UPDATE company_operations 
SET project_name = company_name 
WHERE company_name ILIKE 'Proyecto %';