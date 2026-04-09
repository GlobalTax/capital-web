
-- Allow all admin users (any role) to READ outbound_lists
DROP POLICY IF EXISTS "Admins can manage contact lists" ON public.outbound_lists;
DROP POLICY IF EXISTS "Admins can manage outbound_lists" ON public.outbound_lists;

CREATE POLICY "All admin users can read outbound_lists"
  ON public.outbound_lists FOR SELECT
  USING (public.has_role(auth.uid(), 'viewer'::admin_role));

CREATE POLICY "Admins can write outbound_lists"
  ON public.outbound_lists FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::admin_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::admin_role));

-- Allow all admin users to READ outbound_list_companies
DROP POLICY IF EXISTS "Admins can manage outbound_list_companies" ON public.outbound_list_companies;

CREATE POLICY "All admin users can read outbound_list_companies"
  ON public.outbound_list_companies FOR SELECT
  USING (public.has_role(auth.uid(), 'viewer'::admin_role));

CREATE POLICY "Admins can write outbound_list_companies"
  ON public.outbound_list_companies FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::admin_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::admin_role));

-- Allow all admin users to READ outbound_list_campaigns
DROP POLICY IF EXISTS "Admins can manage outbound_list_campaigns" ON public.outbound_list_campaigns;

CREATE POLICY "All admin users can read outbound_list_campaigns"
  ON public.outbound_list_campaigns FOR SELECT
  USING (public.has_role(auth.uid(), 'viewer'::admin_role));

CREATE POLICY "Admins can write outbound_list_campaigns"
  ON public.outbound_list_campaigns FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::admin_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::admin_role));
