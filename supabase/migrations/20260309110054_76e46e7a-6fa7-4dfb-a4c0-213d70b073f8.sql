ALTER TABLE campaign_followup_sends 
ADD COLUMN IF NOT EXISTS seguimiento_estado TEXT DEFAULT NULL;