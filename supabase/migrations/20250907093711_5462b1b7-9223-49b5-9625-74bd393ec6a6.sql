-- Add new fields to contact_leads table for buyer-specific data
ALTER TABLE public.contact_leads 
ADD COLUMN investment_budget text,
ADD COLUMN sectors_of_interest text;