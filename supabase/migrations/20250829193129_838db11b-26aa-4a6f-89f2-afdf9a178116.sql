-- Add missing columns to company_valuations table
ALTER TABLE public.company_valuations 
ADD COLUMN activity_description TEXT,
ADD COLUMN referrer TEXT;