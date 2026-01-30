-- ============================================================================
-- Status History Tracking System
-- Creates unified trigger function and triggers for tables with lead_status_crm
-- ============================================================================

-- 1. Create unified function for logging status changes
CREATE OR REPLACE FUNCTION public.log_unified_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_lead_type TEXT;
BEGIN
  -- Only log if status actually changed
  IF OLD.lead_status_crm IS NOT DISTINCT FROM NEW.lead_status_crm THEN
    RETURN NEW;
  END IF;
  
  -- Determine lead_type based on the source table
  v_lead_type := CASE TG_TABLE_NAME
    WHEN 'company_valuations' THEN 'valuation'
    WHEN 'contact_leads' THEN 'contact'
    WHEN 'collaborator_applications' THEN 'collaborator'
    ELSE 'unknown'
  END;
  
  -- Insert activity record with full metadata
  INSERT INTO public.lead_activities (
    lead_id, 
    lead_type, 
    activity_type, 
    description, 
    metadata, 
    created_by
  ) VALUES (
    NEW.id,
    v_lead_type,
    'status_changed',
    'Estado cambiado de ' || COALESCE(OLD.lead_status_crm::text, 'sin estado') 
      || ' a ' || COALESCE(NEW.lead_status_crm::text, 'sin estado'),
    jsonb_build_object(
      'from_status', OLD.lead_status_crm,
      'to_status', NEW.lead_status_crm,
      'change_source', 'direct_update',
      'table_name', TG_TABLE_NAME
    ),
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_log_lead_status_change ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_log_unified_status_change ON public.company_valuations;
DROP TRIGGER IF EXISTS trigger_log_unified_status_change ON public.contact_leads;
DROP TRIGGER IF EXISTS trigger_log_unified_status_change ON public.collaborator_applications;

-- 3. Create triggers for each table that has lead_status_crm

-- company_valuations
CREATE TRIGGER trigger_log_unified_status_change
  AFTER UPDATE ON public.company_valuations
  FOR EACH ROW
  WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm)
  EXECUTE FUNCTION public.log_unified_status_change();

-- contact_leads
CREATE TRIGGER trigger_log_unified_status_change
  AFTER UPDATE ON public.contact_leads
  FOR EACH ROW
  WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm)
  EXECUTE FUNCTION public.log_unified_status_change();

-- collaborator_applications
CREATE TRIGGER trigger_log_unified_status_change
  AFTER UPDATE ON public.collaborator_applications
  FOR EACH ROW
  WHEN (OLD.lead_status_crm IS DISTINCT FROM NEW.lead_status_crm)
  EXECUTE FUNCTION public.log_unified_status_change();

-- 4. Create optimized index for status change analytics (if not exists)
CREATE INDEX IF NOT EXISTS idx_lead_activities_status_analytics 
ON public.lead_activities (activity_type, created_at DESC)
WHERE activity_type = 'status_changed';

-- 5. Create index on metadata for conversion queries
CREATE INDEX IF NOT EXISTS idx_lead_activities_status_transitions
ON public.lead_activities ((metadata->>'from_status'), (metadata->>'to_status'))
WHERE activity_type = 'status_changed';

-- 6. Create view for easy conversion analysis
DROP VIEW IF EXISTS public.v_status_transitions;
CREATE VIEW public.v_status_transitions AS
SELECT 
  id,
  lead_id,
  lead_type,
  metadata->>'from_status' as from_status,
  metadata->>'to_status' as to_status,
  metadata->>'change_source' as change_source,
  created_at,
  created_by
FROM public.lead_activities
WHERE activity_type = 'status_changed';