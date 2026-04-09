-- Auto-classify leads by revenue on INSERT
CREATE OR REPLACE FUNCTION public.auto_classify_lead_by_revenue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_status_crm = 'nuevo' AND NEW.revenue IS NOT NULL THEN
    IF NEW.revenue >= 1000000 THEN
      NEW.lead_status_crm := 'contactando';
    ELSE
      NEW.lead_status_crm := 'calificado';
    END IF;
    NEW.status_updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_classify_lead
  BEFORE INSERT ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_classify_lead_by_revenue();