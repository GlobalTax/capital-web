-- FINAL SECURITY FIX: Use restrictive policies to properly block anonymous access

-- Remove the permissive "deny anonymous" policy (it doesn't work as expected with permissive logic)
DROP POLICY IF EXISTS "Deny anonymous access to company valuations" ON public.company_valuations;

-- Create a RESTRICTIVE policy that explicitly blocks anonymous users
CREATE POLICY "Block anonymous access to company valuations"
ON public.company_valuations
FOR SELECT
TO anon
USING (false)
WITH CHECK (false);

-- Make the restrictive policy non-permissive (restrictive)
-- Note: We need to recreate this as a restrictive policy, not permissive
DROP POLICY IF EXISTS "Block anonymous access to company valuations" ON public.company_valuations;

-- Create restrictive policy that blocks anonymous access  
CREATE POLICY "Block anonymous access to company valuations"
ON public.company_valuations
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- Also ensure other sensitive tables have restrictive anonymous blocking
CREATE POLICY "Block anonymous access to contact leads"
ON public.contact_leads
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Block anonymous access to collaborator applications"
ON public.collaborator_applications
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Block anonymous access to admin users"
ON public.admin_users
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);