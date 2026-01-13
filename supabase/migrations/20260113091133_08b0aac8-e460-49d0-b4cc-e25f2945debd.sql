-- Create table to track MNA Apollo imports
CREATE TABLE public.mna_apollo_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_criteria JSONB,
  total_results INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  preview_data JSONB,
  import_results JSONB,
  error_message TEXT,
  import_type TEXT, -- 'contacts' or 'organizations'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes for common queries
CREATE INDEX idx_mna_apollo_imports_status ON public.mna_apollo_imports(status);
CREATE INDEX idx_mna_apollo_imports_created_at ON public.mna_apollo_imports(created_at DESC);
CREATE INDEX idx_mna_apollo_imports_created_by ON public.mna_apollo_imports(created_by);

-- Enable Row Level Security
ALTER TABLE public.mna_apollo_imports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "mna_apollo_imports_select_policy" 
ON public.mna_apollo_imports 
FOR SELECT 
TO authenticated 
USING (public.current_user_can_read());

CREATE POLICY "mna_apollo_imports_insert_policy" 
ON public.mna_apollo_imports 
FOR INSERT 
TO authenticated 
WITH CHECK (public.current_user_can_write());

CREATE POLICY "mna_apollo_imports_update_policy" 
ON public.mna_apollo_imports 
FOR UPDATE 
TO authenticated 
USING (public.current_user_can_write());

CREATE POLICY "mna_apollo_imports_delete_policy" 
ON public.mna_apollo_imports 
FOR DELETE 
TO authenticated 
USING (public.current_user_can_write());