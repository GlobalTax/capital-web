-- Create exit_readiness_tests table for storing test results and leads
CREATE TABLE public.exit_readiness_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Lead data (captured before showing results)
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  company_name TEXT,
  
  -- Test responses and scoring
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_score INTEGER NOT NULL DEFAULT 0,
  readiness_level TEXT CHECK (readiness_level IN ('ready', 'in_progress', 'needs_work')),
  
  -- Personalized recommendations
  recommendations JSONB DEFAULT '[]'::jsonb,
  
  -- Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  page_origin TEXT DEFAULT 'test_exit_ready',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exit_readiness_tests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Allow anonymous insert" ON public.exit_readiness_tests
  FOR INSERT WITH CHECK (true);

-- Allow admins to select all
CREATE POLICY "Allow admin select" ON public.exit_readiness_tests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow admins to update
CREATE POLICY "Allow admin update" ON public.exit_readiness_tests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create index for email lookups
CREATE INDEX idx_exit_readiness_tests_email ON public.exit_readiness_tests(email);

-- Create index for created_at
CREATE INDEX idx_exit_readiness_tests_created_at ON public.exit_readiness_tests(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_exit_readiness_tests_updated_at
  BEFORE UPDATE ON public.exit_readiness_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();