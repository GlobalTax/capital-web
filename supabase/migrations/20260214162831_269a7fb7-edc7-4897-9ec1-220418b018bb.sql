
-- Fase 1: Ampliar content_calendar para soportar multi-canal y IA

-- Add channel column
ALTER TABLE public.content_calendar 
ADD COLUMN IF NOT EXISTS channel text DEFAULT 'blog'
CHECK (channel IN ('linkedin_company', 'linkedin_personal', 'blog', 'newsletter', 'crm_internal'));

-- Add linkedin_format column
ALTER TABLE public.content_calendar 
ADD COLUMN IF NOT EXISTS linkedin_format text
CHECK (linkedin_format IN ('carousel', 'long_text', 'infographic', 'opinion', 'storytelling', 'data_highlight'));

-- Add AI content fields
ALTER TABLE public.content_calendar 
ADD COLUMN IF NOT EXISTS ai_generated_content text;

ALTER TABLE public.content_calendar 
ADD COLUMN IF NOT EXISTS ai_generation_metadata jsonb;

-- Add target audience
ALTER TABLE public.content_calendar 
ADD COLUMN IF NOT EXISTS target_audience text DEFAULT 'sellers'
CHECK (target_audience IN ('sellers', 'buyers', 'advisors', 'internal'));

-- Drop the old content_type check constraint and add expanded one
ALTER TABLE public.content_calendar 
DROP CONSTRAINT IF EXISTS content_calendar_content_type_check;

ALTER TABLE public.content_calendar 
ADD CONSTRAINT content_calendar_content_type_check 
CHECK (content_type IN ('article', 'guide', 'case_study', 'report', 'infographic', 'newsletter', 'linkedin_post', 'carousel', 'newsletter_edition', 'sector_brief', 'crm_sheet'));

-- Add key_data field for storing the key PE data point associated with each idea
ALTER TABLE public.content_calendar 
ADD COLUMN IF NOT EXISTS key_data text;
