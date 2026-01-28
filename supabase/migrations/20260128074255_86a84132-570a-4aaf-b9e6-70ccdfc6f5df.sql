-- Create calculator_error_alerts table for tracking sent alerts
CREATE TABLE public.calculator_error_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_count INTEGER NOT NULL,
  time_window_start TIMESTAMPTZ NOT NULL,
  time_window_end TIMESTAMPTZ NOT NULL,
  error_types JSONB DEFAULT '[]'::jsonb,
  sample_errors JSONB DEFAULT '[]'::jsonb,
  alert_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipients TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calculator_error_alerts ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can read alerts
CREATE POLICY "Admin users can read calculator error alerts"
  ON public.calculator_error_alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Service role can insert (for Edge Function)
CREATE POLICY "Service role can insert calculator error alerts"
  ON public.calculator_error_alerts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create index for faster cooldown checks
CREATE INDEX idx_calculator_error_alerts_sent_at 
  ON public.calculator_error_alerts(alert_sent_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.calculator_error_alerts IS 'Tracks calculator error alert notifications sent to the team';