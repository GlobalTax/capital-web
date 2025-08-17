-- FINAL SECURITY FIX: Use restrictive policies to properly block anonymous access

-- Create restrictive policy that blocks anonymous access to company_valuations
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