-- Add unique constraint to rate_limits table for ON CONFLICT to work properly
ALTER TABLE public.rate_limits 
ADD CONSTRAINT rate_limits_identifier_category_unique 
UNIQUE (identifier, category);