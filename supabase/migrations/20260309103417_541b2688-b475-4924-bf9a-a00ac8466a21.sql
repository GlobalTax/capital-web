CREATE TABLE IF NOT EXISTS campaign_followup_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  sequence_number INTEGER NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, sequence_number)
);

CREATE TABLE IF NOT EXISTS campaign_followup_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES campaign_followup_sequences(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL,
  company_id UUID NOT NULL,
  to_email TEXT NOT NULL,
  subject_resolved TEXT NOT NULL,
  body_resolved TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campaign_followup_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage campaign_followup_sequences" ON campaign_followup_sequences;
CREATE POLICY "Authenticated users can manage campaign_followup_sequences"
ON campaign_followup_sequences FOR ALL TO authenticated
USING (true) WITH CHECK (true);

ALTER TABLE campaign_followup_sends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can manage campaign_followup_sends" ON campaign_followup_sends;
CREATE POLICY "Authenticated users can manage campaign_followup_sends"
ON campaign_followup_sends FOR ALL TO authenticated
USING (true) WITH CHECK (true);