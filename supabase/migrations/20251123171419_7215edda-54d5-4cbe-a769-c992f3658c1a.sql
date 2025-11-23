-- Fix get_valuation_analytics: Remove window function FILTER that causes 400 error
-- Simplified field_interactions calculation without LEAD/FILTER

CREATE OR REPLACE FUNCTION public.get_valuation_analytics(p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  total_sessions INT;
  completed_sessions INT;
  conversion_rate NUMERIC;
  avg_time_per_session NUMERIC;
  recovery_modal_shown INT;
  recovery_accepted INT;
  recovery_rejected INT;
  step_counts INT[] := ARRAY[0, 0, 0, 0];
  funnel_data JSON;
  field_interactions JSON;
BEGIN
  -- Calculate KPIs from company_valuations
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE final_valuation IS NOT NULL),
    AVG(time_spent_seconds) FILTER (WHERE time_spent_seconds IS NOT NULL) / 60.0
  INTO total_sessions, completed_sessions, avg_time_per_session
  FROM company_valuations
  WHERE created_at BETWEEN p_start_date AND p_end_date;
  
  -- Calculate conversion rate
  IF total_sessions > 0 THEN
    conversion_rate := (completed_sessions::NUMERIC / total_sessions) * 100;
  ELSE
    conversion_rate := 0;
  END IF;
  
  -- Get recovery metrics from tracking_events
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'recovery_modal_shown'),
    COUNT(*) FILTER (WHERE event_type = 'recovery_accepted'),
    COUNT(*) FILTER (WHERE event_type = 'recovery_rejected')
  INTO recovery_modal_shown, recovery_accepted, recovery_rejected
  FROM tracking_events
  WHERE created_at BETWEEN p_start_date AND p_end_date
    AND event_type IN ('recovery_modal_shown', 'recovery_accepted', 'recovery_rejected');
  
  -- Calculate funnel by steps
  SELECT 
    ARRAY[
      COUNT(*) FILTER (WHERE current_step >= 1 OR final_valuation IS NOT NULL),
      COUNT(*) FILTER (WHERE current_step >= 2 OR final_valuation IS NOT NULL),
      COUNT(*) FILTER (WHERE current_step >= 3 OR final_valuation IS NOT NULL),
      COUNT(*) FILTER (WHERE final_valuation IS NOT NULL)
    ]
  INTO step_counts
  FROM company_valuations
  WHERE created_at BETWEEN p_start_date AND p_end_date;
  
  -- Build funnel data
  SELECT json_agg(
    json_build_object(
      'step', step_num,
      'stepName', step_name,
      'count', step_count,
      'percentage', CASE WHEN total_sessions > 0 THEN ROUND((step_count::NUMERIC / total_sessions) * 100, 1) ELSE 0 END,
      'dropoff', CASE 
        WHEN step_num > 1 AND prev_count > 0 THEN ROUND(((prev_count - step_count)::NUMERIC / prev_count) * 100, 1)
        ELSE 0
      END
    )
  )
  INTO funnel_data
  FROM (
    SELECT 
      step_num,
      step_name,
      step_count,
      LAG(step_count) OVER (ORDER BY step_num) AS prev_count
    FROM (
      VALUES 
        (1, 'Datos Básicos', step_counts[1]),
        (2, 'Datos Financieros', step_counts[2]),
        (3, 'Características', step_counts[3]),
        (4, 'Completado', step_counts[4])
    ) AS steps(step_num, step_name, step_count)
  ) funnel_steps;
  
  -- Calculate field interactions (SIMPLIFIED VERSION - no window functions)
  -- Only counts touches, sets avgTimeSpent and abandonRate to 0 temporarily
  SELECT COALESCE(json_agg(
    json_build_object(
      'fieldName', field_name,
      'touches', touches,
      'avgTimeSpent', 0,
      'abandonRate', 0
    )
    ORDER BY touches DESC
  ), '[]'::json)
  INTO field_interactions
  FROM (
    SELECT 
      event_data->>'field_name' AS field_name,
      COUNT(*) FILTER (WHERE event_type = 'field_focus') AS touches
    FROM tracking_events
    WHERE created_at BETWEEN p_start_date AND p_end_date
      AND event_type IN ('field_focus', 'field_blur', 'field_change')
      AND event_data->>'field_name' IS NOT NULL
    GROUP BY event_data->>'field_name'
  ) field_stats
  WHERE touches > 0;
  
  -- Build final result
  SELECT json_build_object(
    'kpis', json_build_object(
      'totalSessions', total_sessions,
      'conversionRate', ROUND(conversion_rate, 1),
      'recoveredSessions', recovery_accepted,
      'avgTimePerSession', ROUND(COALESCE(avg_time_per_session, 0), 1)
    ),
    'funnel', COALESCE(funnel_data, '[]'::json),
    'recovery', json_build_object(
      'modalsShown', recovery_modal_shown,
      'accepted', recovery_accepted,
      'rejected', recovery_rejected,
      'acceptanceRate', CASE WHEN recovery_modal_shown > 0 THEN ROUND((recovery_accepted::NUMERIC / recovery_modal_shown) * 100) ELSE 0 END
    ),
    'fieldInteractions', field_interactions
  ) INTO result;
  
  RETURN result;
END;
$function$;