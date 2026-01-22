-- Función que crea registro histórico en cada UPDATE/INSERT
CREATE OR REPLACE FUNCTION log_campaign_cost_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO campaign_cost_history (
    campaign_cost_id,
    campaign_name,
    channel,
    results,
    amount,
    cost_per_result,
    daily_budget,
    monthly_budget,
    target_cpl,
    internal_status,
    delivery_status,
    notes,
    changed_by,
    change_type
  ) VALUES (
    NEW.id,
    NEW.campaign_name,
    NEW.channel,
    NEW.results,
    NEW.amount,
    CASE WHEN NEW.results > 0 THEN NEW.amount / NEW.results ELSE NULL END,
    NEW.daily_budget,
    NEW.monthly_budget,
    NEW.target_cpl,
    NEW.internal_status,
    NEW.delivery_status,
    NEW.notes,
    auth.uid(),
    CASE WHEN TG_OP = 'INSERT' THEN 'create' ELSE 'update' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger automático en INSERT y UPDATE
DROP TRIGGER IF EXISTS campaign_cost_history_trigger ON campaign_costs;
CREATE TRIGGER campaign_cost_history_trigger
AFTER INSERT OR UPDATE ON campaign_costs
FOR EACH ROW EXECUTE FUNCTION log_campaign_cost_change();