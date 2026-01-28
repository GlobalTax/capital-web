-- =====================================================
-- CALCULATOR ERROR LOGGING TABLE
-- Captures calculator failures for monitoring and recovery
-- =====================================================

CREATE TABLE IF NOT EXISTS public.calculator_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL CHECK (error_type IN ('calculation', 'submission', 'validation', 'network', 'unknown')),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component TEXT NOT NULL,
  action TEXT NOT NULL,
  company_data JSONB,
  current_step INTEGER,
  unique_token TEXT,
  source_project TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for querying recent errors
CREATE INDEX idx_calculator_errors_created_at ON public.calculator_errors(created_at DESC);
CREATE INDEX idx_calculator_errors_error_type ON public.calculator_errors(error_type);
CREATE INDEX idx_calculator_errors_unique_token ON public.calculator_errors(unique_token);

-- Enable RLS
ALTER TABLE public.calculator_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (errors from public calculator)
CREATE POLICY "Allow public to insert errors"
  ON public.calculator_errors
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only admins can view errors
CREATE POLICY "Only admins can view errors"
  ON public.calculator_errors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE public.calculator_errors IS 'Logs calculator failures for monitoring and lead recovery';