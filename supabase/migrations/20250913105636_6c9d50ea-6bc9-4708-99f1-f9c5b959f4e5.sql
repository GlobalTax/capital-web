-- Fix RLS policies for contact_leads table to allow form submissions

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can manage contact leads" ON public.contact_leads;
DROP POLICY IF EXISTS "admins_can_manage_contact_leads" ON public.contact_leads;
DROP POLICY IF EXISTS "admins_can_view_contact_leads" ON public.contact_leads;
DROP POLICY IF EXISTS "secure_contact_lead_insert" ON public.contact_leads;

-- Create clean, working policies

-- Admin policies for full management
CREATE POLICY "contact_leads_admin_select" ON public.contact_leads
FOR SELECT USING (current_user_is_admin());

CREATE POLICY "contact_leads_admin_update" ON public.contact_leads
FOR UPDATE USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "contact_leads_admin_delete" ON public.contact_leads
FOR DELETE USING (current_user_is_admin());

-- Simple public insert policy for contact form submissions
CREATE POLICY "contact_leads_public_insert" ON public.contact_leads
FOR INSERT WITH CHECK (
  -- Basic field validation
  full_name IS NOT NULL AND 
  length(TRIM(full_name)) >= 2 AND 
  length(TRIM(full_name)) <= 100 AND
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(email) <= 254 AND
  company IS NOT NULL AND 
  length(TRIM(company)) >= 2 AND 
  length(TRIM(company)) <= 100 AND
  (service_type IS NULL OR service_type IN ('vender', 'comprar', 'otros'))
);