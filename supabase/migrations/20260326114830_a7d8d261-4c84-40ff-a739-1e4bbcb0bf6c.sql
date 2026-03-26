-- Trigger: auto-assign project_name if missing
CREATE OR REPLACE FUNCTION set_default_project_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_name IS NULL OR NEW.project_name = '' THEN
    NEW.project_name := 'Proyecto ' || SUBSTRING(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_project_name
BEFORE INSERT OR UPDATE ON company_operations
FOR EACH ROW EXECUTE FUNCTION set_default_project_name();

-- Backfill existing records without project_name
UPDATE company_operations
SET project_name = 'Proyecto ' || SUBSTRING(id::text, 1, 8)
WHERE project_name IS NULL;