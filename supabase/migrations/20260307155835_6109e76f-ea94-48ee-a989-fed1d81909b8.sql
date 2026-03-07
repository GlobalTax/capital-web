CREATE TABLE public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  function_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  tokens_total INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(12,8) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  metadata JSONB
);

-- Index for dashboard queries
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs (created_at DESC);
CREATE INDEX idx_ai_usage_logs_function ON public.ai_usage_logs (function_name);
CREATE INDEX idx_ai_usage_logs_provider ON public.ai_usage_logs (provider);

-- RLS: only service role can insert (edge functions), admins can read
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (edge functions use service role key)
-- No policy needed for service role as it bypasses RLS

-- Allow authenticated admin users to read
CREATE POLICY "Admins can read ai_usage_logs"
ON public.ai_usage_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);