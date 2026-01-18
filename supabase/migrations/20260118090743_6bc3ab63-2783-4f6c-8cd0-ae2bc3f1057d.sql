-- Add new columns to empresas table for enhanced Apollo data mapping
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS technologies JSONB;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS departmental_headcount JSONB;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS alexa_ranking INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN empresas.linkedin_url IS 'LinkedIn company profile URL from Apollo';
COMMENT ON COLUMN empresas.facebook_url IS 'Facebook company page URL from Apollo';
COMMENT ON COLUMN empresas.founded_year IS 'Year the company was founded from Apollo';
COMMENT ON COLUMN empresas.keywords IS 'Business keywords/tags from Apollo';
COMMENT ON COLUMN empresas.technologies IS 'Technology stack used by the company from Apollo';
COMMENT ON COLUMN empresas.departmental_headcount IS 'Employee count by department from Apollo';
COMMENT ON COLUMN empresas.alexa_ranking IS 'Alexa website ranking from Apollo';