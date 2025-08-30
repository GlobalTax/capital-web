-- Create sell_leads table for optimized lead capture
CREATE TABLE public.sell_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  revenue_range TEXT NOT NULL,
  sector TEXT,
  message TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
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
ALTER TABLE public.sell_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage sell leads" 
ON public.sell_leads 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure sell lead submission" 
ON public.sell_leads 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'sell_lead', 
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
  length(TRIM(company)) <= 100 AND
  revenue_range IS NOT NULL AND
  revenue_range IN ('<1M', '1-5M', '5-10M', '>10M')
);

-- Trigger for updated_at
CREATE TRIGGER update_sell_leads_updated_at
  BEFORE UPDATE ON public.sell_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();