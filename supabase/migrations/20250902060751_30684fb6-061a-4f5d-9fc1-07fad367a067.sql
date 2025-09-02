-- Create operation_inquiries table for company operation contact forms
CREATE TABLE public.operation_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.operation_inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage operation inquiries" 
ON public.operation_inquiries 
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure operation inquiry submission" 
ON public.operation_inquiries 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'operation_inquiry', 
    3, 
    1440
  ) AND
  full_name IS NOT NULL AND
  length(TRIM(full_name)) >= 2 AND
  length(TRIM(full_name)) <= 100 AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  message IS NOT NULL AND
  length(TRIM(message)) >= 10 AND
  operation_id IS NOT NULL AND
  company_name IS NOT NULL AND
  length(TRIM(company_name)) >= 2
);

-- Create trigger for updated_at
CREATE TRIGGER update_operation_inquiries_updated_at
  BEFORE UPDATE ON public.operation_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_operation_inquiries_operation_id ON public.operation_inquiries(operation_id);
CREATE INDEX idx_operation_inquiries_email ON public.operation_inquiries(email);
CREATE INDEX idx_operation_inquiries_created_at ON public.operation_inquiries(created_at DESC);