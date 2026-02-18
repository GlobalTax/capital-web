ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_case_studies_display_order ON case_studies(display_order);