-- CRITICAL SECURITY FIXES
-- Phase 1: Fix Critical Data Exposure

-- 1. Remove dangerous public read access from tool_ratings
DROP POLICY IF EXISTS "Anyone can view tool ratings" ON public.tool_ratings;

-- 2. Clean up conflicting newsletter_subscribers policies
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

-- 3. Add rate limiting to public newsletter subscriptions
CREATE POLICY "Rate limited newsletter subscription"
ON public.newsletter_subscribers
FOR INSERT 
WITH CHECK (
  public.check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'newsletter_subscription', 
    3, -- max 3 subscriptions
    60 -- per hour
  ) AND 
  email IS NOT NULL AND 
  length(TRIM(email)) >= 5 AND 
  length(email) <= 254 AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- 4. Add rate limiting to tool ratings
CREATE POLICY "Rate limited tool rating creation"
ON public.tool_ratings
FOR INSERT 
WITH CHECK (
  public.check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'tool_rating',
    5, -- max 5 ratings
    60 -- per hour  
  ) AND
  tool_name IS NOT NULL AND
  rating >= 1 AND rating <= 5
);

-- 5. Enhanced security logging for sensitive data mutations
CREATE OR REPLACE FUNCTION public.log_sensitive_data_mutations()
RETURNS TRIGGER AS $$
BEGIN
  -- Log mutations to sensitive customer data
  PERFORM public.log_security_event(
    'SENSITIVE_DATA_MUTATION',
    CASE 
      WHEN TG_OP = 'DELETE' THEN 'high'
      WHEN TG_OP = 'UPDATE' THEN 'medium'
      ELSE 'info'
    END,
    TG_TABLE_NAME,
    TG_OP,
    jsonb_build_object(
      'user_id', auth.uid(),
      'user_role', auth.role(),
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply logging triggers to sensitive tables (only for mutations)
CREATE TRIGGER sensitive_mutations_log_contact_leads  
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_leads
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_mutations();

CREATE TRIGGER sensitive_mutations_log_collaborator_applications
  AFTER INSERT OR UPDATE OR DELETE ON public.collaborator_applications  
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_mutations();