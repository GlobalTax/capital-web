-- Create tracking events table for secure event storage
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  event_data JSONB DEFAULT '{}',
  company_domain TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tracking_events_visitor_id ON public.tracking_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session_id ON public.tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON public.tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON public.tracking_events(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_events_company_domain ON public.tracking_events(company_domain) WHERE company_domain IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Create policies for tracking events
CREATE POLICY "Allow anonymous insert with rate limiting" 
ON public.tracking_events 
FOR INSERT 
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, visitor_id, 'unknown'), 
    'tracking_event', 
    50,  -- 50 events per window
    5    -- 5 minute window
  ) AND 
  visitor_id IS NOT NULL AND 
  session_id IS NOT NULL AND 
  event_type IS NOT NULL
);

-- Admins can view all tracking events
CREATE POLICY "Admins can view tracking events" 
ON public.tracking_events 
FOR SELECT 
USING (current_user_is_admin());

-- Service role can manage all tracking events
CREATE POLICY "Service role can manage tracking events" 
ON public.tracking_events 
FOR ALL 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

-- Create function to clean up old tracking events (older than 6 months)
CREATE OR REPLACE FUNCTION public.cleanup_old_tracking_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  DELETE FROM public.tracking_events 
  WHERE created_at < now() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;