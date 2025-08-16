-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule abandonment detection to run every 15 minutes
SELECT cron.schedule(
  'abandonment-detector-job',
  '*/15 * * * *', -- every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/abandonment-detector',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw"}'::jsonb,
        body:=concat('{"scheduled": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Add search_path to existing functions for security
ALTER FUNCTION public.update_valuation_activity() SET search_path = 'public';
ALTER FUNCTION public.detect_abandoned_valuations() SET search_path = 'public';
ALTER FUNCTION public.send_recovery_emails() SET search_path = 'public';