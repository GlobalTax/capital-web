-- Security Fix Migration: Add Missing RLS Policies and Secure Database Functions

-- ============================================================================
-- PHASE 1: Add Missing RLS Policies
-- ============================================================================

-- 1. automation_workflows - Admin only access
CREATE POLICY "Admins can manage automation workflows" 
ON public.automation_workflows 
FOR ALL 
USING (current_user_is_admin());

-- 2. business_metrics - Admin only access
CREATE POLICY "Admins can manage business metrics" 
ON public.business_metrics 
FOR ALL 
USING (current_user_is_admin());

-- 3. content_analytics - Admin view, system insert
CREATE POLICY "Admins can view content analytics" 
ON public.content_analytics 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "System can insert content analytics" 
ON public.content_analytics 
FOR INSERT 
WITH CHECK (true);

-- 4. email_sequences - Admin only access
CREATE POLICY "Admins can manage email sequences" 
ON public.email_sequences 
FOR ALL 
USING (current_user_is_admin());

-- 5. email_sequence_steps - Admin only access
CREATE POLICY "Admins can manage email sequence steps" 
ON public.email_sequence_steps 
FOR ALL 
USING (current_user_is_admin());

-- 6. lead_scoring_rules - Admin manage, system use
CREATE POLICY "Admins can manage lead scoring rules" 
ON public.lead_scoring_rules 
FOR ALL 
USING (current_user_is_admin());

CREATE POLICY "System can read active lead scoring rules" 
ON public.lead_scoring_rules 
FOR SELECT 
USING (is_active = true);

-- 7. workflow_executions - Admin view, system manage
CREATE POLICY "Admins can view workflow executions" 
ON public.workflow_executions 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "System can manage workflow executions" 
ON public.workflow_executions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update workflow executions" 
ON public.workflow_executions 
FOR UPDATE 
USING (true);

-- ============================================================================
-- PHASE 2: Secure Database Functions (Add SET search_path TO 'public')
-- ============================================================================

-- 1. Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path TO 'public';

-- 2. Update generate_unique_v4_token function  
CREATE OR REPLACE FUNCTION public.generate_unique_v4_token()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;

-- 3. Update set_v4_token function
CREATE OR REPLACE FUNCTION public.set_v4_token()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.unique_token IS NULL THEN
    NEW.unique_token := generate_unique_v4_token();
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Update update_admin_users_updated_at function
CREATE OR REPLACE FUNCTION public.update_admin_users_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 5. Update generate_proposal_number function
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  current_year TEXT;
  sequence_num TEXT;
  proposal_number TEXT;
BEGIN
  current_year := EXTRACT(year FROM now())::TEXT;
  
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') INTO sequence_num
  FROM public.fee_proposals 
  WHERE EXTRACT(year FROM created_at) = EXTRACT(year FROM now());
  
  proposal_number := 'PROP-' || current_year || '-' || sequence_num;
  
  RETURN proposal_number;
END;
$$;

-- 6. Update generate_unique_proposal_url function
CREATE OR REPLACE FUNCTION public.generate_unique_proposal_url()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  unique_string TEXT;
BEGIN
  unique_string := encode(gen_random_bytes(16), 'hex');
  RETURN unique_string;
END;
$$;

-- 7. Update handle_new_proposal function
CREATE OR REPLACE FUNCTION public.handle_new_proposal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.proposal_number IS NULL THEN
    NEW.proposal_number := public.generate_proposal_number();
  END IF;
  
  IF NEW.unique_url IS NULL THEN
    NEW.unique_url := public.generate_unique_proposal_url();
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Update update_list_contact_count function
CREATE OR REPLACE FUNCTION public.update_list_contact_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

-- 9. Update update_tag_usage_count function
CREATE OR REPLACE FUNCTION public.update_tag_usage_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.contact_tags 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.contact_tags 
    SET usage_count = usage_count - 1 
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 10. Update calculate_lead_score function
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_visitor_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  total_points INTEGER := 0;
  behavior_record RECORD;
  rule_record RECORD;
  days_since_event INTEGER;
  adjusted_points INTEGER;
BEGIN
  FOR behavior_record IN 
    SELECT lbe.*, lsr.points, lsr.decay_days
    FROM public.lead_behavior_events lbe
    LEFT JOIN public.lead_scoring_rules lsr ON lbe.rule_id = lsr.id
    WHERE lbe.visitor_id = p_visitor_id
    AND lsr.is_active = true
  LOOP
    adjusted_points := behavior_record.points;
    
    IF behavior_record.decay_days IS NOT NULL THEN
      days_since_event := EXTRACT(days FROM now() - behavior_record.created_at);
      
      IF days_since_event > behavior_record.decay_days THEN
        adjusted_points := GREATEST(0, behavior_record.points * (1.0 - (days_since_event::FLOAT / (behavior_record.decay_days * 2))));
      END IF;
    END IF;
    
    total_points := total_points + adjusted_points;
  END LOOP;
  
  RETURN LEAST(total_points, 100);
END;
$$;

-- 11. Update update_lead_score_trigger function
CREATE OR REPLACE FUNCTION public.update_lead_score_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  new_score INTEGER;
  lead_record RECORD;
BEGIN
  new_score := public.calculate_lead_score(NEW.visitor_id);
  
  INSERT INTO public.lead_scores (
    visitor_id, 
    company_domain, 
    total_score, 
    last_activity,
    visit_count
  ) 
  VALUES (
    NEW.visitor_id, 
    NEW.company_domain, 
    new_score, 
    now(),
    1
  )
  ON CONFLICT (visitor_id) 
  DO UPDATE SET 
    total_score = new_score,
    last_activity = now(),
    visit_count = lead_scores.visit_count + 1,
    updated_at = now();
  
  SELECT * INTO lead_record 
  FROM public.lead_scores 
  WHERE visitor_id = NEW.visitor_id;
  
  IF lead_record.is_hot_lead AND NOT EXISTS (
    SELECT 1 FROM public.lead_alerts 
    WHERE lead_score_id = lead_record.id 
    AND alert_type = 'hot_lead'
    AND created_at > now() - INTERVAL '24 hours'
  ) THEN
    INSERT INTO public.lead_alerts (lead_score_id, alert_type, threshold_reached, message, priority)
    VALUES (
      lead_record.id,
      'hot_lead',
      lead_record.total_score,
      'Nuevo lead caliente detectado: ' || COALESCE(lead_record.company_name, lead_record.company_domain, 'Lead anónimo'),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 12. Update cleanup_old_lead_data function
CREATE OR REPLACE FUNCTION public.cleanup_old_lead_data()
RETURNS integer
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  DELETE FROM public.lead_behavior_events 
  WHERE created_at < now() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  DELETE FROM public.lead_scores 
  WHERE last_activity < now() - INTERVAL '1 year'
  AND lead_status = 'cold';
  
  RETURN deleted_count;
END;
$$;

-- 13. Update process_automation_workflows function
CREATE OR REPLACE FUNCTION public.process_automation_workflows()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  workflow_record RECORD;
  lead_record RECORD;
  execution_id UUID;
  processed_count INTEGER := 0;
BEGIN
  FOR workflow_record IN 
    SELECT * FROM public.automation_workflows 
    WHERE is_active = true
  LOOP
    FOR lead_record IN 
      SELECT ls.* FROM public.lead_scores ls
      WHERE NOT EXISTS (
        SELECT 1 FROM public.workflow_executions we
        WHERE we.workflow_id = workflow_record.id 
        AND we.lead_score_id = ls.id
        AND we.execution_status = 'completed'
        AND we.started_at > now() - INTERVAL '24 hours'
      )
    LOOP
      INSERT INTO public.workflow_executions (
        workflow_id, 
        lead_score_id, 
        trigger_data, 
        total_actions
      ) VALUES (
        workflow_record.id,
        lead_record.id,
        row_to_json(lead_record),
        jsonb_array_length(workflow_record.actions->'actions')
      ) RETURNING id INTO execution_id;
      
      processed_count := processed_count + 1;
    END LOOP;
    
    UPDATE public.automation_workflows 
    SET execution_count = execution_count + 1,
        last_executed = now()
    WHERE id = workflow_record.id;
  END LOOP;
  
  RETURN processed_count;
END;
$$;

-- 14. Update trigger_automation_workflows function
CREATE OR REPLACE FUNCTION public.trigger_automation_workflows()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.process_automation_workflows();
  RETURN NEW;
END;
$$;

-- 15. Update update_blog_post_metrics function
CREATE OR REPLACE FUNCTION public.update_blog_post_metrics()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

-- ============================================================================
-- PHASE 3: Create Secure Admin Bootstrapping Function
-- ============================================================================

-- Create a secure function for initial admin setup (to replace the removed auto-creation)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id uuid;
  admin_count integer;
BEGIN
  -- Only allow if no admins exist yet
  SELECT COUNT(*) INTO admin_count FROM public.admin_users WHERE is_active = true;
  
  IF admin_count > 0 THEN
    RETURN false; -- Already have admins, deny
  END IF;
  
  -- Get user ID from auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;
  
  IF target_user_id IS NULL THEN
    RETURN false; -- User not found
  END IF;
  
  -- Create the first admin
  INSERT INTO public.admin_users (
    user_id, 
    email, 
    role, 
    is_active
  ) VALUES (
    target_user_id, 
    user_email, 
    'super_admin', 
    true
  );
  
  RETURN true;
END;
$$;