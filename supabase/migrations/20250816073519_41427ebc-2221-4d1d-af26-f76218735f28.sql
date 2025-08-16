-- Fix RLS policies to allow anonymous upsert by unique_token
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated can insert company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Admins can update company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Admins can update company_valuations" ON public.company_valuations;

-- Create new policies that allow anonymous operations by unique_token
CREATE POLICY "Anyone can insert company valuations" 
ON public.company_valuations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update by unique_token" 
ON public.company_valuations 
FOR UPDATE 
USING (unique_token IS NOT NULL)
WITH CHECK (unique_token IS NOT NULL);

-- Keep admin access for full management
CREATE POLICY "Admins can manage company valuations" 
ON public.company_valuations 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Service role needs full access for edge functions
CREATE POLICY "Service role can manage company valuations" 
ON public.company_valuations 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Set up cron job for abandonment detection every 20 minutes
SELECT cron.schedule(
  'abandonment-detection-job',
  '*/20 * * * *', -- Every 20 minutes
  $$
  SELECT
    net.http_post(
        url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/abandonment-detector',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);