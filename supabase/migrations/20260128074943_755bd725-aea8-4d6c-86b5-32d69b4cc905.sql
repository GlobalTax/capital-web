-- Crear cron job: 2 veces al día (9:00 y 18:00 hora servidor)
SELECT cron.schedule(
  'check-calculator-errors-job',
  '0 9,18 * * *',
  $$
  SELECT net.http_post(
    url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/check-calculator-errors',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I'
    ),
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);