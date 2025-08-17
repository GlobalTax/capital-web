-- Fix security warning: Add search_path to set_deleted_at function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';