-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing cron job for fetch-ma-news
SELECT cron.unschedule('fetch-ma-news-daily') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'fetch-ma-news-daily'
);

SELECT cron.unschedule('fetch-ma-news-6h') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'fetch-ma-news-6h'
);

-- Schedule fetch-ma-news to run every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
SELECT cron.schedule(
  'fetch-ma-news-6h',
  '0 0,6,12,18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/fetch-ma-news',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MTM2NjMsImV4cCI6MjA0OTQ4OTY2M30.LFsfP5pCOYPIQpTPI-TDG6h1VLO3cIqBR2BBy8Njabk"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);