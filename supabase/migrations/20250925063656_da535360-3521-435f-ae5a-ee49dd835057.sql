-- Create banner_events table for tracking
CREATE TABLE public.banner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('impression', 'click')),
  path TEXT NOT NULL,
  user_id UUID NULL, -- References auth.users but no FK constraint since it's managed by Supabase
  ip_address INET NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_banner_events_banner_id ON public.banner_events(banner_id);
CREATE INDEX idx_banner_events_event ON public.banner_events(event);
CREATE INDEX idx_banner_events_created_at ON public.banner_events(created_at);
CREATE INDEX idx_banner_events_path ON public.banner_events(path);

-- Enable RLS
ALTER TABLE public.banner_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banner_events
CREATE POLICY "Anyone can insert banner events" ON public.banner_events
  FOR INSERT 
  WITH CHECK (
    event IN ('impression', 'click') AND
    banner_id IS NOT NULL AND
    path IS NOT NULL AND
    check_rate_limit_enhanced(
      COALESCE(inet_client_addr()::text, 'unknown'), 
      'banner_event', 
      100, -- 100 events per hour max
      60
    )
  );

CREATE POLICY "Admins can view all banner events" ON public.banner_events
  FOR SELECT 
  USING (current_user_is_admin());

-- Create materialized view for daily banner analytics
CREATE MATERIALIZED VIEW public.banner_daily_analytics AS
SELECT 
  banner_id,
  b.name as banner_name,
  b.slug as banner_slug,
  DATE(be.created_at) as event_date,
  COUNT(*) FILTER (WHERE be.event = 'impression') as impressions,
  COUNT(*) FILTER (WHERE be.event = 'click') as clicks,
  CASE 
    WHEN COUNT(*) FILTER (WHERE be.event = 'impression') > 0 
    THEN ROUND(
      (COUNT(*) FILTER (WHERE be.event = 'click')::decimal / 
       COUNT(*) FILTER (WHERE be.event = 'impression')::decimal) * 100, 2
    )
    ELSE 0 
  END as ctr_percentage,
  COUNT(DISTINCT be.path) as unique_pages,
  COUNT(DISTINCT be.user_id) FILTER (WHERE be.user_id IS NOT NULL) as unique_users
FROM public.banner_events be
JOIN public.banners b ON b.id = be.banner_id
GROUP BY banner_id, b.name, b.slug, DATE(be.created_at)
ORDER BY event_date DESC, impressions DESC;

-- Create index on materialized view
CREATE INDEX idx_banner_daily_analytics_banner_date ON public.banner_daily_analytics(banner_id, event_date);
CREATE INDEX idx_banner_daily_analytics_date ON public.banner_daily_analytics(event_date);

-- RLS for materialized view
ALTER MATERIALIZED VIEW public.banner_daily_analytics OWNER TO postgres;

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_banner_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.banner_daily_analytics;
  
  -- Log the refresh
  RAISE LOG 'Banner analytics materialized view refreshed at %', now();
END;
$$;

-- Grant permissions
GRANT SELECT ON public.banner_daily_analytics TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.refresh_banner_analytics() TO authenticated;