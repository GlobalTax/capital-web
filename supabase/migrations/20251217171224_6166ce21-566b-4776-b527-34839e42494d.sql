-- Drop the existing check constraint
ALTER TABLE company_operations DROP CONSTRAINT IF EXISTS check_project_status;

-- Migrate project_status values: in_market→active, in_progress→upcoming, negotiating→exclusive
UPDATE company_operations 
SET project_status = CASE 
  WHEN project_status = 'in_market' THEN 'active'
  WHEN project_status = 'in_progress' THEN 'upcoming'
  WHEN project_status = 'negotiating' THEN 'exclusive'
  ELSE 'active'
END
WHERE project_status IS NOT NULL;

-- Set default for null values
UPDATE company_operations 
SET project_status = 'active'
WHERE project_status IS NULL;

-- Add new check constraint with updated values
ALTER TABLE company_operations 
ADD CONSTRAINT check_project_status 
CHECK (project_status IN ('active', 'upcoming', 'exclusive'));