
-- ============================================================
-- Función que recalcula los totales de una campaña
-- Se llama desde el trigger después de INSERT/UPDATE/DELETE
-- en valuation_campaign_companies
-- ============================================================
CREATE OR REPLACE FUNCTION sync_campaign_totals(p_campaign_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE valuation_campaigns
  SET
    total_companies = (
      SELECT COUNT(*)
      FROM valuation_campaign_companies
      WHERE campaign_id = p_campaign_id
    ),
    total_created = (
      SELECT COUNT(*)
      FROM valuation_campaign_companies
      WHERE campaign_id = p_campaign_id
        AND status IN ('calculated', 'created')
    ),
    total_sent = (
      SELECT COUNT(*)
      FROM valuation_campaign_companies
      WHERE campaign_id = p_campaign_id
        AND status = 'sent'
    ),
    total_errors = (
      SELECT COUNT(*)
      FROM valuation_campaign_companies
      WHERE campaign_id = p_campaign_id
        AND status = 'failed'
    ),
    total_valuation = (
      SELECT COALESCE(SUM(valuation_central), 0)
      FROM valuation_campaign_companies
      WHERE campaign_id = p_campaign_id
        AND valuation_central IS NOT NULL
    ),
    updated_at = NOW()
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- Trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_sync_campaign_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle all operations
  IF TG_OP = 'DELETE' THEN
    PERFORM sync_campaign_totals(OLD.campaign_id);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM sync_campaign_totals(NEW.campaign_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If campaign_id changed, sync both old and new
    IF OLD.campaign_id IS DISTINCT FROM NEW.campaign_id THEN
      PERFORM sync_campaign_totals(OLD.campaign_id);
    END IF;
    PERFORM sync_campaign_totals(NEW.campaign_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- Drop existing trigger if any, then create fresh
-- ============================================================
DROP TRIGGER IF EXISTS trg_sync_campaign_totals ON valuation_campaign_companies;

CREATE TRIGGER trg_sync_campaign_totals
  AFTER INSERT OR UPDATE OR DELETE
  ON valuation_campaign_companies
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_campaign_totals();

-- ============================================================
-- Backfill: recalculate all campaigns right now
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT campaign_id FROM valuation_campaign_companies LOOP
    PERFORM sync_campaign_totals(r.campaign_id);
  END LOOP;
END;
$$;
