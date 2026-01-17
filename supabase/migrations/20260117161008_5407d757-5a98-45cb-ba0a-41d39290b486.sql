-- Create apollo_visitor_imports table for tracking import jobs
CREATE TABLE public.apollo_visitor_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'searching', 'importing', 'completed', 'failed')),
  list_id TEXT NOT NULL,
  list_type TEXT NOT NULL DEFAULT 'static' CHECK (list_type IN ('static', 'dynamic')),
  import_type TEXT NOT NULL DEFAULT 'organizations' CHECK (import_type IN ('organizations', 'contacts')),
  total_found INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_message TEXT,
  results JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add Apollo-specific columns to empresas
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS apollo_org_id TEXT,
ADD COLUMN IF NOT EXISTS apollo_intent_level TEXT,
ADD COLUMN IF NOT EXISTS apollo_score INTEGER,
ADD COLUMN IF NOT EXISTS apollo_last_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS apollo_raw_data JSONB;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_empresas_apollo_org_id ON public.empresas(apollo_org_id);
CREATE INDEX IF NOT EXISTS idx_apollo_visitor_imports_status ON public.apollo_visitor_imports(status);
CREATE INDEX IF NOT EXISTS idx_apollo_visitor_imports_created_by ON public.apollo_visitor_imports(created_by);

-- Enable RLS
ALTER TABLE public.apollo_visitor_imports ENABLE ROW LEVEL SECURITY;

-- RLS policies for apollo_visitor_imports
CREATE POLICY "Admin users can view all imports"
ON public.apollo_visitor_imports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admin users can create imports"
ON public.apollo_visitor_imports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admin users can update imports"
ON public.apollo_visitor_imports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_apollo_visitor_imports_updated_at
BEFORE UPDATE ON public.apollo_visitor_imports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();