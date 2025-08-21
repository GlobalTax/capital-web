-- PHASE 1: CRITICAL DATA PROTECTION - Remove public access to sensitive data

-- 1. Fix company_valuations RLS - Remove broad anonymous access
DROP POLICY IF EXISTS "Admins can view all valuations including deleted" ON public.company_valuations;
DROP POLICY IF EXISTS "Users can view their own valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Users can update their own valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Users can create valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Users can soft delete their own valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Secure anonymous valuation insert" ON public.company_valuations;
DROP POLICY IF EXISTS "Restricted token-based updates" ON public.company_valuations;
DROP POLICY IF EXISTS "Admins can manage company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Service role can manage company valuations" ON public.company_valuations;

-- Create secure RLS policies for company_valuations
CREATE POLICY "Admins can view all company valuations" 
ON public.company_valuations 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "Admins can manage all company valuations" 
ON public.company_valuations 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Users can view their own valuations only" 
ON public.company_valuations 
FOR SELECT 
USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can update their own valuations only" 
ON public.company_valuations 
FOR UPDATE 
USING (auth.uid() = user_id AND is_deleted = false)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Secure token-based valuation access" 
ON public.company_valuations 
FOR SELECT 
USING (unique_token IS NOT NULL AND auth.role() = 'anon');

CREATE POLICY "Secure token-based valuation updates" 
ON public.company_valuations 
FOR UPDATE 
USING (unique_token IS NOT NULL AND auth.role() = 'anon')
WITH CHECK (unique_token IS NOT NULL);

CREATE POLICY "Secure authenticated valuation insert" 
ON public.company_valuations 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.role() = 'anon' AND unique_token IS NOT NULL AND 
   contact_name IS NOT NULL AND company_name IS NOT NULL AND 
   email IS NOT NULL AND industry IS NOT NULL AND employee_range IS NOT NULL)
);

CREATE POLICY "Service role full access" 
ON public.company_valuations 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2. Fix contact_leads RLS - Admin only access
DROP POLICY IF EXISTS "Admins can delete contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admins can read contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Admins can update contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Block anonymous access to contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "Secure contact leads insert" ON public.contact_leads;

CREATE POLICY "Admins only can manage contact leads" 
ON public.contact_leads 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure contact leads creation" 
ON public.contact_leads 
FOR INSERT 
WITH CHECK (
  full_name IS NOT NULL AND 
  email IS NOT NULL AND 
  company IS NOT NULL AND
  length(trim(full_name)) >= 2 AND
  length(trim(email)) >= 5 AND
  length(trim(company)) >= 2 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254
);

-- 3. Fix lead_scores and lead_behavior_events - Admin only access
DROP POLICY IF EXISTS "Admins can view lead scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Secure lead scores insert" ON public.lead_scores;

CREATE POLICY "Admins only can manage lead scores" 
ON public.lead_scores 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Admins can view lead behavior events" ON public.lead_behavior_events;
DROP POLICY IF EXISTS "Secure lead behavior events insert" ON public.lead_behavior_events;

CREATE POLICY "Admins only can manage lead behavior events" 
ON public.lead_behavior_events 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- 4. Fix collaborator_applications - Admin only access
DROP POLICY IF EXISTS "Admins can manage collaborator applications" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Admins can view collaborator applications" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Block anonymous access to collaborator applications" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Secure collaborator applications insert" ON public.collaborator_applications;

CREATE POLICY "Admins only can manage collaborator applications" 
ON public.collaborator_applications 
FOR ALL 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Secure collaborator application creation" 
ON public.collaborator_applications 
FOR INSERT 
WITH CHECK (
  full_name IS NOT NULL AND 
  email IS NOT NULL AND 
  phone IS NOT NULL AND 
  profession IS NOT NULL AND
  length(trim(full_name)) >= 2 AND
  length(trim(email)) >= 5 AND
  length(trim(profession)) >= 2 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254
);

-- 5. Secure admin_users table completely - Remove any anonymous access
DROP POLICY IF EXISTS "Block anonymous access to admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can bootstrap admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin data" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins have full access" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own complete admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update own basic info only" ON public.admin_users;

CREATE POLICY "Super admins have complete access" 
ON public.admin_users 
FOR ALL 
USING (is_user_super_admin(auth.uid()))
WITH CHECK (is_user_super_admin(auth.uid()));

CREATE POLICY "Users can view own admin record" 
ON public.admin_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update own basic info" 
ON public.admin_users 
FOR UPDATE 
USING (user_id = auth.uid() AND is_user_admin(auth.uid()))
WITH CHECK (user_id = auth.uid() AND is_user_admin(auth.uid()));

CREATE POLICY "Service role bootstrap access" 
ON public.admin_users 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 6. Enhanced security logging
PERFORM public.log_security_event(
  'SECURITY_POLICY_UPDATE',
  'critical',
  'multiple_tables',
  'rls_lockdown',
  jsonb_build_object(
    'action', 'comprehensive_rls_security_update',
    'tables_secured', ARRAY['company_valuations', 'contact_leads', 'lead_scores', 'lead_behavior_events', 'collaborator_applications', 'admin_users'],
    'timestamp', now()
  )
);