-- ============= CRITICAL SECURITY FIXES =============
-- Phase 1: Emergency Data Protection - Remove public access from sensitive tables

-- Remove existing permissive policies and create secure ones
-- 1. COLLABORATOR_APPLICATIONS - Remove public access
DROP POLICY IF EXISTS "Secure collaborator applications insert" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Anyone can insert collaborator applications" ON public.collaborator_applications;

CREATE POLICY "Secure collaborator applications insert" 
ON public.collaborator_applications 
FOR INSERT 
WITH CHECK (
  -- Strict validation for all required fields
  full_name IS NOT NULL AND
  email IS NOT NULL AND
  phone IS NOT NULL AND
  profession IS NOT NULL AND
  length(trim(full_name)) >= 2 AND
  length(trim(email)) >= 5 AND
  length(trim(profession)) >= 2 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  length(full_name) <= 100 AND
  length(profession) <= 100
);

-- 2. CONTACT_LEADS - Remove public access
DROP POLICY IF EXISTS "Secure contact leads insert" ON public.contact_leads;
DROP POLICY IF EXISTS "Anyone can insert contact leads" ON public.contact_leads;

CREATE POLICY "Secure contact leads insert" 
ON public.contact_leads 
FOR INSERT 
WITH CHECK (
  -- Strict validation for contact leads
  full_name IS NOT NULL AND
  email IS NOT NULL AND
  company IS NOT NULL AND
  length(trim(full_name)) >= 2 AND
  length(trim(email)) >= 5 AND
  length(trim(company)) >= 2 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  length(full_name) <= 100 AND
  length(company) <= 100
);

-- 3. COMPANY_VALUATIONS - Tighten security
DROP POLICY IF EXISTS "Secure valuation insert" ON public.company_valuations;
DROP POLICY IF EXISTS "Anyone can insert valuations" ON public.company_valuations;

CREATE POLICY "Secure valuation insert" 
ON public.company_valuations 
FOR INSERT 
WITH CHECK (
  -- Enhanced validation for valuations
  contact_name IS NOT NULL AND
  company_name IS NOT NULL AND
  email IS NOT NULL AND
  industry IS NOT NULL AND
  employee_range IS NOT NULL AND
  length(trim(contact_name)) >= 2 AND
  length(trim(company_name)) >= 2 AND
  length(trim(email)) >= 5 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  length(contact_name) <= 100 AND
  length(company_name) <= 100 AND
  industry IN ('technology', 'healthcare', 'finance', 'manufacturing', 'retail', 'services', 'other') AND
  employee_range IN ('1-10', '11-50', '51-200', '201-1000', '1000+')
);

-- 4. LEAD_SCORES - Remove public access completely
DROP POLICY IF EXISTS "Anyone can view lead scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Public can insert lead scores" ON public.lead_scores;

-- Only admins can manage lead scores
CREATE POLICY "Admins can manage lead scores" 
ON public.lead_scores 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- 5. LEAD_BEHAVIOR_EVENTS - Tighten access
DROP POLICY IF EXISTS "Anyone can insert behavior events" ON public.lead_behavior_events;

CREATE POLICY "Secure behavior events insert" 
ON public.lead_behavior_events 
FOR INSERT 
WITH CHECK (
  -- Basic validation for behavior tracking
  event_type IS NOT NULL AND
  session_id IS NOT NULL AND
  length(trim(event_type)) >= 2 AND
  length(trim(session_id)) >= 10 AND
  event_type IN ('page_view', 'form_interaction', 'calculator_usage', 'download', 'scroll', 'time_on_page')
);

-- 6. BLOG_ANALYTICS - Tighten security
DROP POLICY IF EXISTS "Anyone can insert blog analytics" ON public.blog_analytics;

CREATE POLICY "Secure blog analytics insert" 
ON public.blog_analytics 
FOR INSERT 
WITH CHECK (
  -- Validation for blog analytics
  post_id IS NOT NULL AND
  post_slug IS NOT NULL AND
  length(trim(post_slug)) >= 1
);

-- 7. AD_CONVERSIONS - Remove public access
DROP POLICY IF EXISTS "System can insert ad conversions" ON public.ad_conversions;

CREATE POLICY "Secure ad conversions insert" 
ON public.ad_conversions 
FOR INSERT 
WITH CHECK (
  -- Only allow valid conversion types
  conversion_type IS NOT NULL AND
  conversion_type IN ('lead', 'valuation_request', 'contact_form', 'newsletter_signup', 'download')
);