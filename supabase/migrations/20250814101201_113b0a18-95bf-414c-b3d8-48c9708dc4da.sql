-- Crear cron job adicional para ejecutar el reporte diario a las 14:00 (2:00 PM)
SELECT cron.schedule(
  'daily-incomplete-valuations-report-afternoon',
  '0 14 * * *', -- Todos los días a las 14:00 (2:00 PM)
  $$
  SELECT
    net.http_post(
        url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/daily-incomplete-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);