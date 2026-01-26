-- Update the CHECK constraint to include 'lead' as a valid entity_type
ALTER TABLE public.corporate_favorites 
DROP CONSTRAINT IF EXISTS corporate_favorites_entity_type_check;

ALTER TABLE public.corporate_favorites 
ADD CONSTRAINT corporate_favorites_entity_type_check 
CHECK (entity_type IN ('buyer', 'contact', 'lead'));