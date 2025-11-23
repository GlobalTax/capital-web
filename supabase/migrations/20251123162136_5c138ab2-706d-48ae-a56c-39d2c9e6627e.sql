-- Create tracking_events table for valuation analytics
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  event_data JSONB DEFAULT '{}'::jsonb,
  company_domain TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tracking_events_session_id ON public.tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_visitor_id ON public.tracking_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_type ON public.tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON public.tracking_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_company_domain ON public.tracking_events(company_domain) WHERE company_domain IS NOT NULL;

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert tracking events
CREATE POLICY "Service role can insert tracking events"
  ON public.tracking_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Anonymous users can insert tracking events (for client-side tracking)
CREATE POLICY "Anonymous can insert tracking events"
  ON public.tracking_events
  FOR INSERT
  TO anon
  WITH CHECK (
    event_type IS NOT NULL 
    AND visitor_id IS NOT NULL 
    AND session_id IS NOT NULL
    AND check_rate_limit_enhanced_safe(
      COALESCE(inet_client_addr()::text, visitor_id), 
      'tracking_event', 
      100, 
      60
    )
  );

-- Policy: Only admins and super admins can read tracking events
CREATE POLICY "Admins can read tracking events"
  ON public.tracking_events
  FOR SELECT
  TO authenticated
  USING (current_user_is_admin());

-- Policy: Super admins can delete old tracking events
CREATE POLICY "Super admins can delete tracking events"
  ON public.tracking_events
  FOR DELETE
  TO authenticated
  USING (is_user_super_admin(auth.uid()));

-- Add comment for documentation
COMMENT ON TABLE public.tracking_events IS 'Stores user interaction tracking events for valuation calculator analytics and session recovery';
COMMENT ON COLUMN public.tracking_events.event_type IS 'Type of event: field_focus, field_blur, field_change, step_change, validation_error, recovery_modal_shown, recovery_accepted, recovery_rejected, etc.';
COMMENT ON COLUMN public.tracking_events.event_data IS 'Additional event metadata in JSON format (field_name, field_value, step_number, error_message, etc.)';
COMMENT ON COLUMN public.tracking_events.session_id IS 'Unique session identifier for grouping events from the same user session';