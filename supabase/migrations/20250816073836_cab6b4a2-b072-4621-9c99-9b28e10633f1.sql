-- Fix the detect_abandoned_valuations function to handle JSON properly
CREATE OR REPLACE FUNCTION public.detect_abandoned_valuations()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  abandoned_count INTEGER := 0;
  valuation_record RECORD;
BEGIN
  -- Find valuations that have been inactive for more than 30 minutes
  -- and are not already marked as abandoned or completed
  FOR valuation_record IN 
    SELECT id, unique_token, contact_name, company_name, email, 
           current_step, completion_percentage, last_activity_at,
           time_spent_seconds
    FROM public.company_valuations 
    WHERE valuation_status IN ('started', 'in_progress')
    AND last_activity_at < now() - INTERVAL '30 minutes'
    AND (abandonment_detected_at IS NULL OR abandonment_detected_at < now() - INTERVAL '24 hours')
    AND unique_token IS NOT NULL -- Ensure we have a valid token
    AND contact_name IS NOT NULL -- Ensure we have at least basic info
  LOOP
    -- Mark as abandoned
    UPDATE public.company_valuations 
    SET valuation_status = 'abandoned',
        abandonment_detected_at = now()
    WHERE id = valuation_record.id;
    
    -- Send alert to admin (using existing function) only if we have the required data
    IF valuation_record.email IS NOT NULL AND valuation_record.email != '' THEN
      PERFORM
        net.http_post(
          url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-incomplete-alert',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || 
                     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw' || 
                     '"}'::jsonb,
          body := json_build_object(
            'valuationId', valuation_record.id,
            'type', 'abandonment',
            'step', COALESCE(valuation_record.current_step, 1),
            'completion', COALESCE(valuation_record.completion_percentage, 0),
            'timeSpent', COALESCE(valuation_record.time_spent_seconds, 0)
          )::jsonb
        );
    END IF;
    
    abandoned_count := abandoned_count + 1;
    
    RAISE LOG 'Abandonment detected for valuation: % (step: %, completion: %)', 
      valuation_record.id, valuation_record.current_step, valuation_record.completion_percentage;
  END LOOP;
  
  RETURN abandoned_count;
END;
$function$