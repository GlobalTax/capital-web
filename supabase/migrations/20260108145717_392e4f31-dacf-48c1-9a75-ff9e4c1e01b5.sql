-- Add AI company summary fields to contact_leads
ALTER TABLE contact_leads 
  ADD COLUMN ai_company_summary TEXT,
  ADD COLUMN ai_company_summary_at TIMESTAMPTZ;

-- Add AI company summary fields to company_valuations
ALTER TABLE company_valuations 
  ADD COLUMN ai_company_summary TEXT,
  ADD COLUMN ai_company_summary_at TIMESTAMPTZ;

-- Add AI company summary fields to general_contact_leads
ALTER TABLE general_contact_leads 
  ADD COLUMN ai_company_summary TEXT,
  ADD COLUMN ai_company_summary_at TIMESTAMPTZ;