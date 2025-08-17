-- Add is_deleted column to company_valuations table
ALTER TABLE public.company_valuations 
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Create optimized index for user queries excluding deleted records
CREATE INDEX idx_company_valuations_user_deleted 
ON public.company_valuations (user_id, is_deleted) 
WHERE is_deleted = FALSE;

-- Update existing RLS policies to exclude deleted records by default

-- Drop existing policies that need to be updated
DROP POLICY IF EXISTS "Users can view their own valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Admins can manage company valuations" ON public.company_valuations;

-- Recreate policies with is_deleted filter
CREATE POLICY "Users can view their own valuations" 
ON public.company_valuations 
FOR SELECT 
USING (
  (user_id = auth.uid() OR auth.role() = 'service_role'::text OR current_user_is_admin()) 
  AND is_deleted = FALSE
);

CREATE POLICY "Admins can manage company valuations" 
ON public.company_valuations 
FOR ALL 
USING (current_user_is_admin()) 
WITH CHECK (current_user_is_admin());

-- Add policy for admins to view deleted records (optional)
CREATE POLICY "Admins can view all valuations including deleted" 
ON public.company_valuations 
FOR SELECT 
USING (current_user_is_admin());

-- Update existing update policy to allow soft delete
DROP POLICY IF EXISTS "Users can update their own valuations" ON public.company_valuations;

CREATE POLICY "Users can update their own valuations" 
ON public.company_valuations 
FOR UPDATE 
USING (
  user_id = auth.uid() 
  OR auth.role() = 'service_role'::text 
  OR current_user_is_admin() 
  OR (user_id IS NULL AND unique_token IS NOT NULL)
);

-- Update delete policy to allow soft delete
DROP POLICY IF EXISTS "Users can delete their own valuations" ON public.company_valuations;

CREATE POLICY "Users can soft delete their own valuations" 
ON public.company_valuations 
FOR UPDATE 
USING (
  (user_id = auth.uid() OR current_user_is_admin())
  AND is_deleted = FALSE
) 
WITH CHECK (
  (user_id = auth.uid() OR current_user_is_admin())
);

-- Add optional deleted_at timestamp for audit trail
ALTER TABLE public.company_valuations 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create trigger to automatically set deleted_at when is_deleted becomes true
CREATE OR REPLACE FUNCTION public.set_deleted_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If is_deleted is being set to true, set deleted_at timestamp
  IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    NEW.deleted_at = now();
  END IF;
  
  -- If is_deleted is being set to false (restoration), clear deleted_at
  IF NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE THEN
    NEW.deleted_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_deleted_at
BEFORE UPDATE ON public.company_valuations
FOR EACH ROW
EXECUTE FUNCTION public.set_deleted_at();