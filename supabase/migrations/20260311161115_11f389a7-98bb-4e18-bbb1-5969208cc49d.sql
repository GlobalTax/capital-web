
-- Fix the trigger to use the correct column name
CREATE OR REPLACE FUNCTION update_outbound_list_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE outbound_lists
  SET contact_count = (
    SELECT COUNT(*) FROM outbound_list_companies WHERE list_id = COALESCE(NEW.list_id, OLD.list_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.list_id, OLD.list_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
