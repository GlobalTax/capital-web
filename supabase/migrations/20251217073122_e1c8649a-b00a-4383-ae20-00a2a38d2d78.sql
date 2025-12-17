-- Create operation_views table for tracking marketplace interactions
CREATE TABLE public.operation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID NOT NULL REFERENCES public.company_operations(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  view_type TEXT NOT NULL CHECK (view_type IN ('card_hover', 'detail_modal', 'compare')),
  source_page TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_operation_views_operation_id ON public.operation_views(operation_id);
CREATE INDEX idx_operation_views_created_at ON public.operation_views(created_at DESC);
CREATE INDEX idx_operation_views_view_type ON public.operation_views(view_type);
CREATE INDEX idx_operation_views_session ON public.operation_views(session_id);

-- Enable RLS
ALTER TABLE public.operation_views ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for tracking)
CREATE POLICY "Anyone can insert operation views"
ON public.operation_views
FOR INSERT
WITH CHECK (
  operation_id IS NOT NULL 
  AND session_id IS NOT NULL 
  AND view_type IS NOT NULL
  AND check_rate_limit_enhanced(COALESCE(inet_client_addr()::text, 'unknown'), 'operation_view', 100, 60)
);

-- Only admins can view tracking data
CREATE POLICY "Admins can view operation views"
ON public.operation_views
FOR SELECT
USING (current_user_is_admin());

-- Create RPC function for marketplace analytics
CREATE OR REPLACE FUNCTION public.get_marketplace_analytics(days_back INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT current_user_is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'total_views', (
      SELECT COUNT(*) 
      FROM operation_views 
      WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
    ),
    'views_by_type', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT view_type, COUNT(*) as count
        FROM operation_views
        WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY view_type
        ORDER BY count DESC
      ) t
    ),
    'top_operations', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          ov.operation_id,
          co.company_name,
          co.sector,
          COUNT(*) as view_count
        FROM operation_views ov
        JOIN company_operations co ON co.id = ov.operation_id
        WHERE ov.created_at >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY ov.operation_id, co.company_name, co.sector
        ORDER BY view_count DESC
        LIMIT 10
      ) t
    ),
    'views_by_day', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM operation_views
        WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      ) t
    ),
    'sector_distribution', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          co.sector,
          COUNT(*) as count
        FROM operation_views ov
        JOIN company_operations co ON co.id = ov.operation_id
        WHERE ov.created_at >= NOW() - (days_back || ' days')::INTERVAL
        GROUP BY co.sector
        ORDER BY count DESC
      ) t
    ),
    'unique_sessions', (
      SELECT COUNT(DISTINCT session_id)
      FROM operation_views
      WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
    )
  ) INTO result;

  RETURN result;
END;
$$;