-- Create legal_leads table for specialized legal consultation leads
CREATE TABLE public.legal_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  sector TEXT,
  message TEXT,
  consultation_type TEXT DEFAULT 'general',
  company_size TEXT,
  transaction_stage TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  hubspot_sent BOOLEAN DEFAULT false,
  hubspot_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_leads ENABLE ROW LEVEL SECURITY;

-- Create policies for legal leads
CREATE POLICY "Admins can manage legal leads" 
ON public.legal_leads 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure legal lead submission" 
ON public.legal_leads 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'legal_lead', 
    2, 
    1440
  ) AND
  full_name IS NOT NULL AND
  length(TRIM(full_name)) >= 2 AND
  length(TRIM(full_name)) <= 100 AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  company IS NOT NULL AND
  length(TRIM(company)) >= 2 AND
  length(TRIM(company)) <= 100
);

-- Add trigger for updated_at
CREATE TRIGGER update_legal_leads_updated_at
  BEFORE UPDATE ON public.legal_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();