-- 1. Restaurar project_name desde company_name para registros ya anonimizados
UPDATE company_operations
SET project_name = company_name
WHERE company_name LIKE 'Proyecto %'
  AND project_name LIKE 'Proyecto ________';

-- 2. Mejorar trigger para futuros registros
CREATE OR REPLACE FUNCTION set_default_project_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_name IS NULL OR NEW.project_name = '' THEN
    IF NEW.company_name IS NOT NULL AND NEW.company_name LIKE 'Proyecto %' THEN
      NEW.project_name := NEW.company_name;
    ELSE
      NEW.project_name := 'Proyecto ' || SUBSTRING(gen_random_uuid()::text, 1, 8);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;