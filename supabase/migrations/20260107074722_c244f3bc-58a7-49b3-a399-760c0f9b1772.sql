-- Create searcher_leads table for Search Fund registration and profiling
CREATE TABLE public.searcher_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Personal data
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  job_title TEXT,
  
  -- Professional background
  background TEXT,
  
  -- Investment structure
  investor_backing TEXT CHECK (investor_backing IN ('institutional', 'family_office', 'self_funded', 'hybrid')),
  investor_names TEXT,
  fund_raised TEXT CHECK (fund_raised IN ('<500K', '500K-1M', '1M-2M', '2M-5M', '>5M')),
  search_phase TEXT CHECK (search_phase IN ('searching', 'committed', 'acquired')),
  
  -- Search criteria
  preferred_sectors TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  min_revenue NUMERIC,
  max_revenue NUMERIC,
  min_ebitda NUMERIC,
  max_ebitda NUMERIC,
  deal_type_preferences TEXT[] DEFAULT '{}',
  additional_criteria TEXT,
  
  -- Source tracking
  how_found_us TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address INET DEFAULT '0.0.0.0'::inet,
  user_agent TEXT,
  
  -- Status and verification
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'verified', 'rejected')),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES admin_users(user_id),
  notes TEXT,
  
  -- Consents
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Email tracking (Brevo)
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  brevo_lists INTEGER[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT searcher_leads_email_unique UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.searcher_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (for registration form)
CREATE POLICY "Allow public insert for searcher registration"
  ON public.searcher_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only admins can select
CREATE POLICY "Only admins can view searcher leads"
  ON public.searcher_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Only admins can update
CREATE POLICY "Only admins can update searcher leads"
  ON public.searcher_leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_searcher_leads_updated_at
  BEFORE UPDATE ON public.searcher_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for matching queries
CREATE INDEX idx_searcher_leads_sectors ON public.searcher_leads USING GIN (preferred_sectors);
CREATE INDEX idx_searcher_leads_status ON public.searcher_leads (status, is_verified);
CREATE INDEX idx_searcher_leads_email ON public.searcher_leads (email);
CREATE INDEX idx_searcher_leads_created ON public.searcher_leads (created_at DESC);