-- Add soft delete columns to company_operations table
ALTER TABLE public.company_operations 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Create trigger to automatically set deleted_at when is_deleted is set to true
CREATE OR REPLACE FUNCTION public.set_deleted_at_operations()
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_set_deleted_at_operations
  BEFORE UPDATE ON public.company_operations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_deleted_at_operations();

-- Update RLS policies to exclude deleted operations from public view
DROP POLICY IF EXISTS "Anyone can view active operations" ON public.company_operations;

CREATE POLICY "Anyone can view active non-deleted operations"
ON public.company_operations
FOR SELECT
USING (is_active = true AND (is_deleted = false OR is_deleted IS NULL));