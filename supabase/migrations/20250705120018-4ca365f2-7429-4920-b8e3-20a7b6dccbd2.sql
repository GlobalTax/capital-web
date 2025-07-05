-- Insertar configuraciones iniciales de integraciones
INSERT INTO public.integration_configs (integration_name, is_active, config_data, sync_frequency_minutes) VALUES
  ('resend', false, '{"api_key": "", "from_email": "noreply@capittal.com"}', 0),
  ('apollo', true, '{"api_key": "", "rate_limit": 100}', 30),
  ('google_ads', true, '{"customer_id": "", "developer_token": ""}', 60),
  ('webhooks', false, '{"endpoints": []}', 0)
ON CONFLICT (integration_name) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  sync_frequency_minutes = EXCLUDED.sync_frequency_minutes,
  updated_at = now();