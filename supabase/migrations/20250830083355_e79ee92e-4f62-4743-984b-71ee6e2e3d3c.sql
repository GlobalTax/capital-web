-- Create table for M&A resources requests
CREATE TABLE public.ma_resources_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  sectors_of_interest TEXT[],
  operation_type TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ma_resources_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for secure submission
CREATE POLICY "Secure MA resources request submission" 
ON public.ma_resources_requests 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'), 
    'ma_resources_request', 
    2, 
    1440
  ) AND
  full_name IS NOT NULL AND
  length(trim(full_name)) >= 2 AND
  length(trim(full_name)) <= 100 AND
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  company IS NOT NULL AND
  length(trim(company)) >= 2 AND
  length(trim(company)) <= 100
);

-- Admins can manage all MA resources requests
CREATE POLICY "Admins can manage MA resources requests" 
ON public.ma_resources_requests 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Create trigger for updating updated_at
CREATE TRIGGER update_ma_resources_requests_updated_at
  BEFORE UPDATE ON public.ma_resources_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();