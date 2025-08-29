-- Create acquisition_leads table for the new landing page
CREATE TABLE public.acquisition_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  investment_range TEXT,
  acquisition_type TEXT,
  sectors_of_interest TEXT,
  target_timeline TEXT,
  additional_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new',
  ip_address INET,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  hubspot_sent BOOLEAN DEFAULT false,
  hubspot_sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.acquisition_leads ENABLE ROW LEVEL SECURITY;

-- Create policies for acquisition_leads
CREATE POLICY "Admins can manage acquisition leads" 
ON public.acquisition_leads 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure acquisition lead submission" 
ON public.acquisition_leads 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'acquisition_lead',
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

-- Create trigger for updated_at
CREATE TRIGGER update_acquisition_leads_updated_at
  BEFORE UPDATE ON public.acquisition_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();