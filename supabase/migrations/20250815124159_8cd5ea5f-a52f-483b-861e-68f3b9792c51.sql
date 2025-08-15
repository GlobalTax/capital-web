-- Add new columns to company_valuations for better abandonment tracking
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS valuation_status TEXT DEFAULT 'started' CHECK (valuation_status IN ('started', 'in_progress', 'abandoned', 'completed')),
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_modified_field TEXT,
ADD COLUMN IF NOT EXISTS abandonment_detected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS recovery_link_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recovery_link_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient queries on status and activity
CREATE INDEX IF NOT EXISTS idx_company_valuations_status_activity 
ON public.company_valuations(valuation_status, last_activity_at);

-- Create index for abandonment detection
CREATE INDEX IF NOT EXISTS idx_company_valuations_abandonment 
ON public.company_valuations(abandonment_detected_at, valuation_status);

-- Drop the old immediate trigger that was causing issues
DROP TRIGGER IF EXISTS send_incomplete_valuation_alert_trigger ON public.company_valuations;

-- Create function to update last activity timestamp
CREATE OR REPLACE FUNCTION public.update_valuation_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity_at and status on any modification
  NEW.last_activity_at = now();
  
  -- Auto-set status based on data completion
  IF NEW.final_valuation IS NOT NULL THEN
    NEW.valuation_status = 'completed';
    NEW.completion_percentage = 100;
  ELSIF NEW.revenue IS NOT NULL AND NEW.ebitda IS NOT NULL THEN
    NEW.valuation_status = 'in_progress';
    NEW.completion_percentage = CASE 
      WHEN NEW.contact_name IS NOT NULL AND NEW.company_name IS NOT NULL 
           AND NEW.email IS NOT NULL AND NEW.industry IS NOT NULL 
           AND NEW.employee_range IS NOT NULL AND NEW.revenue IS NOT NULL 
           AND NEW.ebitda IS NOT NULL THEN 75
      ELSE 50
    END;
  ELSE
    NEW.valuation_status = 'in_progress';
    NEW.completion_percentage = CASE 
      WHEN NEW.contact_name IS NOT NULL AND NEW.company_name IS NOT NULL 
           AND NEW.email IS NOT NULL AND NEW.industry IS NOT NULL 
           AND NEW.employee_range IS NOT NULL THEN 25
      ELSE 10
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity updates
CREATE TRIGGER update_valuation_activity_trigger
BEFORE UPDATE ON public.company_valuations
FOR EACH ROW
EXECUTE FUNCTION public.update_valuation_activity();

-- Create function to detect abandonments (will be called by scheduled function)
CREATE OR REPLACE FUNCTION public.detect_abandoned_valuations()
RETURNS INTEGER AS $$
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
  LOOP
    -- Mark as abandoned
    UPDATE public.company_valuations 
    SET valuation_status = 'abandoned',
        abandonment_detected_at = now()
    WHERE id = valuation_record.id;
    
    -- Send alert to admin (using existing function)
    PERFORM
      net.http_post(
        url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-incomplete-alert',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw' || 
                   '"}'::jsonb,
        body := json_build_object(
          'valuationId', valuation_record.id,
          'type', 'abandonment',
          'step', valuation_record.current_step,
          'completion', valuation_record.completion_percentage,
          'timeSpent', valuation_record.time_spent_seconds
        )::jsonb
      );
    
    abandoned_count := abandoned_count + 1;
    
    RAISE LOG 'Abandonment detected for valuation: % (step: %, completion: %)', 
      valuation_record.id, valuation_record.current_step, valuation_record.completion_percentage;
  END LOOP;
  
  RETURN abandoned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send recovery emails
CREATE OR REPLACE FUNCTION public.send_recovery_emails()
RETURNS INTEGER AS $$
DECLARE
  recovery_count INTEGER := 0;
  valuation_record RECORD;
BEGIN
  -- Find abandoned valuations that haven't received recovery emails yet
  -- and were abandoned within the last 24 hours
  FOR valuation_record IN 
    SELECT id, unique_token, contact_name, company_name, email,
           current_step, completion_percentage, abandonment_detected_at
    FROM public.company_valuations 
    WHERE valuation_status = 'abandoned'
    AND recovery_link_sent = FALSE
    AND abandonment_detected_at > now() - INTERVAL '24 hours'
    AND abandonment_detected_at < now() - INTERVAL '2 hours' -- Wait 2 hours before sending recovery
    AND email IS NOT NULL
    AND email != ''
  LOOP
    -- Send recovery email
    PERFORM
      net.http_post(
        url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-recovery-email',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw' || 
                   '"}'::jsonb,
        body := json_build_object(
          'valuationId', valuation_record.id,
          'token', valuation_record.unique_token,
          'email', valuation_record.email,
          'contactName', valuation_record.contact_name,
          'companyName', valuation_record.company_name,
          'step', valuation_record.current_step,
          'completion', valuation_record.completion_percentage
        )::jsonb
      );
    
    -- Mark recovery email as sent
    UPDATE public.company_valuations 
    SET recovery_link_sent = TRUE,
        recovery_link_sent_at = now()
    WHERE id = valuation_record.id;
    
    recovery_count := recovery_count + 1;
    
    RAISE LOG 'Recovery email sent for valuation: %', valuation_record.id;
  END LOOP;
  
  RETURN recovery_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;