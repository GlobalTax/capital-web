-- Add missing has_adjustments column to company_valuations table
-- This field is being sent by the frontend but doesn't exist in the database
ALTER TABLE public.company_valuations 
ADD COLUMN has_adjustments BOOLEAN DEFAULT false;