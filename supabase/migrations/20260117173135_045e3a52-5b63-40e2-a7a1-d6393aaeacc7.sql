-- Drop the old check constraint and add a new one with the updated values
ALTER TABLE public.apollo_visitor_imports 
DROP CONSTRAINT IF EXISTS apollo_visitor_imports_list_type_check;

ALTER TABLE public.apollo_visitor_imports 
ADD CONSTRAINT apollo_visitor_imports_list_type_check 
CHECK (list_type IN ('static', 'dynamic', 'contacts', 'accounts'));