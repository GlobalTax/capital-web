-- Clean up duplicate policies that might be conflicting

-- Remove the old "Deny anonymous access" policy that still exists
DROP POLICY IF EXISTS "Deny anonymous access to company valuations" ON public.company_valuations;
DROP POLICY IF EXISTS "Deny anonymous access to contact leads" ON public.contact_leads;  
DROP POLICY IF EXISTS "Deny anonymous access to collaborator applications" ON public.collaborator_applications;
DROP POLICY IF EXISTS "Deny anonymous access to admin users" ON public.admin_users;