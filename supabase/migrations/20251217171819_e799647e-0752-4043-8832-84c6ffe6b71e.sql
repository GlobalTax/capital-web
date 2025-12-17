-- Create table for tracking operation shares
CREATE TABLE public.operation_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES public.company_operations(id) ON DELETE CASCADE,
  share_method TEXT NOT NULL CHECK (share_method IN ('whatsapp', 'email', 'copy_link')),
  session_id TEXT,
  source_page TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET DEFAULT '0.0.0.0'::inet,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operation_shares ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking
CREATE POLICY "Anyone can insert share events" 
ON public.operation_shares 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view share data
CREATE POLICY "Admins can view share events" 
ON public.operation_shares 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Create index for analytics queries
CREATE INDEX idx_operation_shares_operation_id ON public.operation_shares(operation_id);
CREATE INDEX idx_operation_shares_created_at ON public.operation_shares(created_at DESC);
CREATE INDEX idx_operation_shares_method ON public.operation_shares(share_method);