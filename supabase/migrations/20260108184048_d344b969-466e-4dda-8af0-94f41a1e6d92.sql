-- Add acquisition_channel_id to general_contact_leads for consistency
ALTER TABLE general_contact_leads 
ADD COLUMN IF NOT EXISTS acquisition_channel_id UUID REFERENCES acquisition_channels(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_general_contact_leads_acquisition_channel 
ON general_contact_leads(acquisition_channel_id);