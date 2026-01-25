-- Add key_highlights column to corporate_buyers table
ALTER TABLE public.corporate_buyers
ADD COLUMN key_highlights TEXT[];