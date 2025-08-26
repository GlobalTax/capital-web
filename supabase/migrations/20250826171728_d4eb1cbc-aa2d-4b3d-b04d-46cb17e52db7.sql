-- Fix admin_users RLS policies to prevent 406 errors
-- First, check and update the RLS policies for admin_users table

-- Drop problematic policies that might be causing 406 errors
DROP POLICY IF EXISTS "Enhanced admin user security" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admin_users;
DROP POLICY IF EXISTS "Users can update own basic info" ON public.admin_users;

-- Create simplified RLS policies for admin_users
CREATE POLICY "Admins can view all admin users"
  ON public.admin_users
  FOR SELECT
  USING (
    current_user_is_admin() OR 
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Admins can update admin users"
  ON public.admin_users
  FOR UPDATE
  USING (
    is_user_super_admin(auth.uid()) OR 
    (auth.uid() = user_id AND is_user_admin(auth.uid())) OR
    auth.role() = 'service_role'
  )
  WITH CHECK (
    is_user_super_admin(auth.uid()) OR 
    (auth.uid() = user_id AND is_user_admin(auth.uid())) OR
    auth.role() = 'service_role'
  );

CREATE POLICY "Admins can insert admin users"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (
    is_user_super_admin(auth.uid()) OR 
    auth.role() = 'service_role'
  );