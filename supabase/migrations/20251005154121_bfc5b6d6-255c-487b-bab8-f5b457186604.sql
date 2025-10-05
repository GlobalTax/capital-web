-- Create accountex_leads table for Accountex Madrid 2025 landing page
CREATE TABLE IF NOT EXISTS public.accountex_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  preferred_meeting_date TEXT,
  sectors_of_interest TEXT,
  
  -- Tracking fields
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- CRM sync fields
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  hubspot_sent BOOLEAN DEFAULT false,
  hubspot_sent_at TIMESTAMPTZ,
  brevo_sent BOOLEAN DEFAULT false,
  brevo_sent_at TIMESTAMPTZ,
  
  -- Status fields
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'meeting_scheduled', 'closed', 'disqualified')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.accountex_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all accountex leads
CREATE POLICY "Admins can manage accountex leads"
ON public.accountex_leads
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Policy: Public insert with rate limiting and validation
CREATE POLICY "Secure accountex lead submission"
ON public.accountex_leads
FOR INSERT
WITH CHECK (
  check_rate_limit_enhanced_safe(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'accountex_lead',
    2,
    1440
  )
  AND full_name IS NOT NULL
  AND length(TRIM(full_name)) >= 2
  AND length(TRIM(full_name)) <= 100
  AND company IS NOT NULL
  AND length(TRIM(company)) >= 2
  AND length(TRIM(company)) <= 100
  AND email IS NOT NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accountex_leads_email ON public.accountex_leads(email);
CREATE INDEX IF NOT EXISTS idx_accountex_leads_created_at ON public.accountex_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_accountex_leads_status ON public.accountex_leads(status);
CREATE INDEX IF NOT EXISTS idx_accountex_leads_priority ON public.accountex_leads(priority);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_accountex_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_accountex_leads_updated_at
  BEFORE UPDATE ON public.accountex_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_accountex_leads_updated_at();