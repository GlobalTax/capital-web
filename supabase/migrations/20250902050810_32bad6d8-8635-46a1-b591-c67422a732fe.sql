-- Crear constraint único en rate_limits para que funcione ON CONFLICT
ALTER TABLE public.rate_limits 
ADD CONSTRAINT rate_limits_identifier_category_unique 
UNIQUE (identifier, category);