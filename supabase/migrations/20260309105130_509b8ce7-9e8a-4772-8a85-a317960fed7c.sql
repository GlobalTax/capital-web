ALTER TABLE campaign_followup_sends
DROP CONSTRAINT IF EXISTS campaign_followup_sends_status_check;

ALTER TABLE campaign_followup_sends
ADD CONSTRAINT campaign_followup_sends_status_check
CHECK (status IN ('pending', 'sent', 'error', 'cancelled'));