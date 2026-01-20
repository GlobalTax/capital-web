-- Fix: Update the ensure_single_active_rod function to filter by language and file_type
-- This allows having one active document per language (ES + EN simultaneously)

CREATE OR REPLACE FUNCTION public.ensure_single_active_rod()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Only deactivate documents of the SAME language and file_type
    UPDATE public.rod_documents 
    SET 
      is_active = false, 
      deactivated_at = now(),
      updated_at = now()
    WHERE is_active = true 
      AND id != NEW.id
      AND is_deleted = false
      AND language = NEW.language      -- Filter by language (ES/EN)
      AND file_type = NEW.file_type;   -- Filter by file type (PDF/Excel)
    
    NEW.activated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reactivate the EN document that was incorrectly deactivated
UPDATE public.rod_documents 
SET 
  is_active = true, 
  activated_at = now(),
  deactivated_at = NULL,
  updated_at = now()
WHERE id = '3017c828-bbbb-48de-88e3-437f38011987'
  AND is_deleted = false;