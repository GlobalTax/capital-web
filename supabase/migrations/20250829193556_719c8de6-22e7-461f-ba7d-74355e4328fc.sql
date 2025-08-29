-- Add missing adjustment_amount column to company_valuations table
ALTER TABLE public.company_valuations 
ADD COLUMN adjustment_amount NUMERIC;