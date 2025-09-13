-- Create dedicated table for company acquisition inquiries
CREATE TABLE public.company_acquisition_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Contact Information
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,  
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Acquisition Details
  investment_budget TEXT, -- 'menos-500k', '500k-1m', '1m-5m', '5m-10m', 'mas-10m'
  sectors_of_interest TEXT,
  acquisition_type TEXT, -- 'strategic', 'financial', 'operational', etc.
  target_timeline TEXT,
  preferred_location TEXT,
  message TEXT,
  
  -- Status and Processing
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  
  -- Email and Notifications
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_message_id TEXT,
  email_opened BOOLEAN DEFAULT false,
  email_opened_at TIMESTAMP WITH TIME ZONE,
  
  -- CRM Integration
  hubspot_sent BOOLEAN DEFAULT false,
  hubspot_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Processing
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  notes TEXT,
  
  -- Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  page_origin TEXT NOT NULL DEFAULT 'compra-empresas',
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_acquisition_inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage acquisition inquiries" 
ON public.company_acquisition_inquiries 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure acquisition inquiry submission" 
ON public.company_acquisition_inquiries 
FOR INSERT 
WITH CHECK (
  -- Rate limiting
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'acquisition_inquiry', 
    2, 
    1440  -- 2 submissions per day
  ) AND
  -- Required field validation
  full_name IS NOT NULL AND 
  length(TRIM(full_name)) >= 2 AND 
  length(TRIM(full_name)) <= 100 AND
  company IS NOT NULL AND 
  length(TRIM(company)) >= 2 AND 
  length(TRIM(company)) <= 100 AND
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254
);

-- Add indexes for performance
CREATE INDEX idx_company_acquisition_inquiries_email ON public.company_acquisition_inquiries(email);
CREATE INDEX idx_company_acquisition_inquiries_status ON public.company_acquisition_inquiries(status);
CREATE INDEX idx_company_acquisition_inquiries_created ON public.company_acquisition_inquiries(created_at);
CREATE INDEX idx_company_acquisition_inquiries_page_origin ON public.company_acquisition_inquiries(page_origin);

-- Add trigger for updated_at
CREATE TRIGGER update_company_acquisition_inquiries_updated_at
  BEFORE UPDATE ON public.company_acquisition_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key for processed_by
ALTER TABLE public.company_acquisition_inquiries 
ADD CONSTRAINT fk_acquisition_inquiries_processed_by 
FOREIGN KEY (processed_by) REFERENCES public.admin_users(user_id);