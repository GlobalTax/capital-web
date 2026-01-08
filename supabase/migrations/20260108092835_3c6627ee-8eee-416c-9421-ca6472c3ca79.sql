-- Crear: Fetch M&A news 1 vez al día a las 07:00 UTC
SELECT cron.schedule(
  'fetch-ma-news-job',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/fetch-ma-news',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Crear: Process news con IA a las 07:30 UTC
SELECT cron.schedule(
  'process-news-ai-job',
  '30 7 * * *',
  $$
  SELECT net.http_post(
    url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/process-news-ai',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I"}'::jsonb,
    body:='{"scheduled": true, "limit": 10}'::jsonb
  ) as request_id;
  $$
);