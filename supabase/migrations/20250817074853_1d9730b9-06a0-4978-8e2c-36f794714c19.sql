-- Create message_logs table for tracking all message communications
CREATE TABLE public.message_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  valuation_id UUID REFERENCES public.company_valuations(id),
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending', 'delivered')),
  provider_id TEXT,
  provider_name TEXT,
  recipient TEXT, -- Partial phone/email for identification without full PII
  payload_summary JSONB DEFAULT '{}',
  error_details TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view message logs" 
ON public.message_logs 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "Service role can insert message logs" 
ON public.message_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Create indexes for optimization
CREATE INDEX idx_message_logs_valuation_id ON public.message_logs(valuation_id);
CREATE INDEX idx_message_logs_created_at ON public.message_logs(created_at);
CREATE INDEX idx_message_logs_type_status_created_at ON public.message_logs(type, status, created_at);