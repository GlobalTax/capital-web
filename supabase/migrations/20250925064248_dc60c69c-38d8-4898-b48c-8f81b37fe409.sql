-- Set up cron job to refresh banner analytics daily at midnight
SELECT cron.schedule(
  'refresh-banner-analytics',
  '0 0 * * *', -- Daily at midnight
  $$
  SELECT public.refresh_banner_analytics();
  $$
);