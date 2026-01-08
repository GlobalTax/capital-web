-- Añadir columna acquisition_channel_id a las tablas que no la tienen

-- collaborator_applications
ALTER TABLE collaborator_applications 
ADD COLUMN IF NOT EXISTS acquisition_channel_id UUID REFERENCES acquisition_channels(id);

CREATE INDEX IF NOT EXISTS idx_collaborator_applications_channel 
ON collaborator_applications(acquisition_channel_id);

-- acquisition_leads
ALTER TABLE acquisition_leads 
ADD COLUMN IF NOT EXISTS acquisition_channel_id UUID REFERENCES acquisition_channels(id);

CREATE INDEX IF NOT EXISTS idx_acquisition_leads_channel 
ON acquisition_leads(acquisition_channel_id);

-- advisor_valuations
ALTER TABLE advisor_valuations 
ADD COLUMN IF NOT EXISTS acquisition_channel_id UUID REFERENCES acquisition_channels(id);

CREATE INDEX IF NOT EXISTS idx_advisor_valuations_channel 
ON advisor_valuations(acquisition_channel_id);

-- company_acquisition_inquiries
ALTER TABLE company_acquisition_inquiries 
ADD COLUMN IF NOT EXISTS acquisition_channel_id UUID REFERENCES acquisition_channels(id);

CREATE INDEX IF NOT EXISTS idx_company_acquisition_inquiries_channel 
ON company_acquisition_inquiries(acquisition_channel_id);