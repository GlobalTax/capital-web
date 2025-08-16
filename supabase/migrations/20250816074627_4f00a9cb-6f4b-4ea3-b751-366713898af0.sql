-- Adjust abandonment detection times for short valuation form
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
  -- Find valuations that are genuinely incomplete and inactive
  -- REDUCED: 8 minutes for short form (was 20 minutes)
  FOR valuation_record IN 
    SELECT id, unique_token, contact_name, company_name, email, 
           current_step, completion_percentage, last_activity_at,
           time_spent_seconds, revenue, ebitda
    FROM public.company_valuations 
    WHERE valuation_status IN ('started', 'in_progress')
    AND last_activity_at < now() - INTERVAL '8 minutes'  -- Reduced from 20 to 8 minutes
    AND (abandonment_detected_at IS NULL OR abandonment_detected_at < now() - INTERVAL '24 hours')
    AND unique_token IS NOT NULL
    AND contact_name IS NOT NULL
    AND email IS NOT NULL AND email != ''
    -- More realistic completion criteria: either low completion % OR missing key financial data
    AND (
      COALESCE(completion_percentage, 0) < 75  -- Less than 75% complete
      OR (revenue IS NULL OR ebitda IS NULL)   -- Missing key financial data
    )
    AND final_valuation IS NULL  -- Definitely not completed
  LOOP
    -- Mark as abandoned
    UPDATE public.company_valuations 
    SET valuation_status = 'abandoned',
        abandonment_detected_at = now()
    WHERE id = valuation_record.id;
    
    -- Send alert to admin with proper JSON formatting
    PERFORM
      net.http_post(
        url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-incomplete-alert',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGZpY2oiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ5ODI3OTUzLCJleHAiOjIwNjU0MDM5NTN9.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw'
        ),
        body := jsonb_build_object(
          'valuationId', valuation_record.id::text,
          'type', 'abandonment',
          'step', COALESCE(valuation_record.current_step, 1),
          'completion', COALESCE(valuation_record.completion_percentage, 0),
          'timeSpent', COALESCE(valuation_record.time_spent_seconds, 0)
        )
      );
    
    abandoned_count := abandoned_count + 1;
    
    RAISE LOG 'Abandonment detected for valuation: % - Company: %, Email: %, Completion: % percent, Revenue: %, EBITDA: %', 
      valuation_record.id, 
      COALESCE(valuation_record.company_name, 'N/A'), 
      valuation_record.email,
      COALESCE(valuation_record.completion_percentage, 0),
      CASE WHEN valuation_record.revenue IS NOT NULL THEN 'Yes' ELSE 'No' END,
      CASE WHEN valuation_record.ebitda IS NOT NULL THEN 'Yes' ELSE 'No' END;
  END LOOP;
  
  RETURN abandoned_count;
END;
$function$;

-- Update immediate abandonment alerts for shorter form
CREATE OR REPLACE FUNCTION public.trigger_immediate_abandonment_alert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  time_since_activity INTERVAL;
BEGIN
  -- Only process updates, not inserts
  IF TG_OP = 'UPDATE' THEN
    -- Calculate time since last activity
    time_since_activity = now() - NEW.last_activity_at;
    
    -- REDUCED: 3 minutes for immediate alert (was 10 minutes)
    -- If the user has been inactive for more than 3 minutes and has some progress
    -- but is not completed, trigger an immediate alert
    IF time_since_activity > INTERVAL '3 minutes' 
       AND NEW.valuation_status IN ('started', 'in_progress')
       AND NEW.email IS NOT NULL AND NEW.email != ''
       AND NEW.contact_name IS NOT NULL
       AND (COALESCE(NEW.completion_percentage, 0) > 10 AND COALESCE(NEW.completion_percentage, 0) < 75)
       AND NEW.final_valuation IS NULL
       AND (NEW.immediate_alert_sent IS NULL OR NEW.immediate_alert_sent = FALSE) THEN
      
      -- Send immediate alert
      PERFORM
        net.http_post(
          url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-incomplete-alert',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGZpY2oiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ5ODI3OTUzLCJleHAiOjIwNjU0MDM5NTN9.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw'
          ),
          body := jsonb_build_object(
            'valuationId', NEW.id::text,
            'type', 'immediate_alert',
            'step', COALESCE(NEW.current_step, 1),
            'completion', COALESCE(NEW.completion_percentage, 0),
            'timeSpent', COALESCE(NEW.time_spent_seconds, 0)
          )
        );
      
      -- Mark immediate alert as sent
      NEW.immediate_alert_sent = TRUE;
      NEW.immediate_alert_sent_at = now();
      
      RAISE LOG 'Immediate abandonment alert triggered for valuation: % - Completion: % percent', 
        NEW.id, COALESCE(NEW.completion_percentage, 0);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;