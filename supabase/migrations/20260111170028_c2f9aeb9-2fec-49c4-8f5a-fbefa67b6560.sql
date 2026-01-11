-- Create cr_apollo_imports table for tracking Apollo import jobs
CREATE TABLE public.cr_apollo_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_criteria JSONB DEFAULT '{}'::jsonb,
  total_results INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'searching', 'previewing', 'importing', 'completed', 'failed')),
  preview_data JSONB DEFAULT '[]'::jsonb,
  import_results JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  import_type TEXT DEFAULT 'people' CHECK (import_type IN ('people', 'organizations', 'mixed'))
);

-- Enable RLS
ALTER TABLE public.cr_apollo_imports ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin users can manage cr_apollo_imports"
  ON public.cr_apollo_imports
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Create index for performance
CREATE INDEX idx_cr_apollo_imports_created_at ON public.cr_apollo_imports(created_at DESC);
CREATE INDEX idx_cr_apollo_imports_status ON public.cr_apollo_imports(status);