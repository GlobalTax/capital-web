-- FASE 8 - MIGRACIÓN 2: Asegurar funciones trigger regulares
-- Agregar SET search_path a 4 funciones trigger sin SECURITY DEFINER (best practice)

-- 1. calculate_time_entry_duration
CREATE OR REPLACE FUNCTION public.calculate_time_entry_duration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. handle_new_proposal
CREATE OR REPLACE FUNCTION public.handle_new_proposal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.proposal_number IS NULL THEN
    NEW.proposal_number := public.generate_proposal_number();
  END IF;
  
  IF NEW.unique_url IS NULL THEN
    NEW.unique_url := public.generate_unique_proposal_url();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. update_blog_post_metrics
CREATE OR REPLACE FUNCTION public.update_blog_post_metrics()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.blog_post_metrics (
    post_id,
    post_slug,
    total_views,
    unique_views,
    avg_reading_time,
    avg_scroll_percentage,
    last_viewed,
    updated_at
  )
  SELECT 
    NEW.post_id,
    NEW.post_slug,
    COUNT(*) as total_views,
    COUNT(DISTINCT COALESCE(NEW.visitor_id, NEW.session_id)) as unique_views,
    COALESCE(AVG(NULLIF(NEW.reading_time, 0)), 0)::INTEGER as avg_reading_time,
    COALESCE(AVG(NULLIF(NEW.scroll_percentage, 0)), 0)::INTEGER as avg_scroll_percentage,
    MAX(NEW.viewed_at) as last_viewed,
    now() as updated_at
  FROM public.blog_analytics 
  WHERE post_id = NEW.post_id
  ON CONFLICT (post_id) 
  DO UPDATE SET
    total_views = (
      SELECT COUNT(*) 
      FROM public.blog_analytics 
      WHERE post_id = NEW.post_id
    ),
    unique_views = (
      SELECT COUNT(DISTINCT COALESCE(visitor_id, session_id))
      FROM public.blog_analytics 
      WHERE post_id = NEW.post_id
    ),
    avg_reading_time = (
      SELECT COALESCE(AVG(NULLIF(reading_time, 0)), 0)::INTEGER
      FROM public.blog_analytics 
      WHERE post_id = NEW.post_id
    ),
    avg_scroll_percentage = (
      SELECT COALESCE(AVG(NULLIF(scroll_percentage, 0)), 0)::INTEGER
      FROM public.blog_analytics 
      WHERE post_id = NEW.post_id
    ),
    last_viewed = NEW.viewed_at,
    updated_at = now();

  RETURN NEW;
END;
$function$;

-- 4. update_list_contact_count
CREATE OR REPLACE FUNCTION public.update_list_contact_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_lists 
    SET contact_count = contact_count + 1 
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_lists 
    SET contact_count = contact_count - 1 
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

COMMENT ON FUNCTION public.calculate_time_entry_duration() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.handle_new_proposal() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.update_blog_post_metrics() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.update_list_contact_count() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';