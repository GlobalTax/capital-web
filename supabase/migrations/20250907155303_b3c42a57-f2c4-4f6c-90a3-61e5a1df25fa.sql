-- Add confidential value field to case studies table
ALTER TABLE public.case_studies 
ADD COLUMN is_value_confidential boolean DEFAULT false;