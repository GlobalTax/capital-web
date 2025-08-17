-- Add user_id field to company_valuations table
ALTER TABLE public.company_valuations 
ADD COLUMN user_id UUID NULL;

-- Add foreign key constraint to auth.users
ALTER TABLE public.company_valuations 
ADD CONSTRAINT fk_company_valuations_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create optimized indexes
CREATE INDEX idx_company_valuations_user_id_created_at 
ON public.company_valuations (user_id, created_at DESC);

CREATE INDEX idx_company_valuations_status_user_id 
ON public.company_valuations (valuation_status, user_id);

-- Drop existing restrictive policies and create new ones for user management
DROP POLICY IF EXISTS "Block anonymous access to company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Only admins can view company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Only admins can delete company valuations" ON public.company_valuations;

-- Create new RLS policies for user area
CREATE POLICY "Users can view their own valuations" 
ON public.company_valuations 
FOR SELECT 
USING (
  (user_id = auth.uid()) OR 
  (auth.role() = 'service_role'::text) OR 
  current_user_is_admin()
);

CREATE POLICY "Users can create valuations" 
ON public.company_valuations 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR  -- Authenticated users
  (auth.uid() IS NULL AND user_id IS NULL) OR           -- Anonymous users
  (auth.role() = 'service_role'::text)                  -- Service role
);

CREATE POLICY "Users can update their own valuations" 
ON public.company_valuations 
FOR UPDATE 
USING (
  (user_id = auth.uid()) OR 
  (auth.role() = 'service_role'::text) OR 
  current_user_is_admin() OR
  (user_id IS NULL AND unique_token IS NOT NULL)        -- Allow anonymous updates via token
);

CREATE POLICY "Users can delete their own valuations" 
ON public.company_valuations 
FOR DELETE 
USING (
  (user_id = auth.uid()) OR 
  current_user_is_admin()
);

-- Create trigger to automatically assign user_id for authenticated users
CREATE OR REPLACE FUNCTION public.set_user_id_on_valuation()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is authenticated and user_id is not set, assign it
  IF auth.uid() IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_user_id_on_valuation_insert
  BEFORE INSERT ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_on_valuation();