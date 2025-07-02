-- PHASE 1: Fix Infinite Recursion - Remove all conflicting policies and functions
-- Drop all existing policies on admin_users that cause recursion
DROP POLICY IF EXISTS "Allow all authenticated users to view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow all authenticated users to insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow all authenticated users to update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view and manage non-super admin users" ON admin_users;

-- Drop problematic functions
DROP FUNCTION IF EXISTS public.check_is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.current_user_is_admin() CASCADE;

-- PHASE 2: Create secure SECURITY DEFINER function that bypasses RLS
CREATE OR REPLACE FUNCTION public.check_user_admin_role(check_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role::text 
     FROM admin_users 
     WHERE user_id = check_user_id 
     AND is_active = true
     LIMIT 1), 
    'none'
  );
$$;

-- Create helper function for admin checks
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.check_user_admin_role(check_user_id) IN ('admin', 'super_admin');
$$;

-- Create helper function for super admin checks
CREATE OR REPLACE FUNCTION public.is_user_super_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.check_user_admin_role(check_user_id) = 'super_admin';
$$;

-- Recreate current_user_is_admin for backwards compatibility
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_user_admin(auth.uid());
$$;

-- PHASE 3: Create new, non-recursive RLS policies

-- Policy 1: Super admins can do everything
CREATE POLICY "Super admins have full access" 
ON admin_users
FOR ALL
USING (public.is_user_super_admin(auth.uid()));

-- Policy 2: Regular admins can manage non-super-admin users
CREATE POLICY "Admins can manage non-super-admins"
ON admin_users
FOR ALL
USING (
  public.is_user_admin(auth.uid()) 
  AND (role != 'super_admin'::admin_role OR public.is_user_super_admin(auth.uid()))
);

-- Policy 3: Bootstrap policy for initial admin creation (service role only)
CREATE POLICY "Service role can bootstrap admin users"
ON admin_users
FOR ALL
USING (auth.role() = 'service_role');

-- Policy 4: Users can view their own admin record
CREATE POLICY "Users can view own admin record"
ON admin_users
FOR SELECT
USING (user_id = auth.uid());

-- PHASE 4: Insert current user as super admin if not exists (bootstrap)
INSERT INTO admin_users (user_id, role, is_active, email, full_name)
SELECT 
  auth.uid(),
  'super_admin'::admin_role,
  true,
  COALESCE(auth.email(), 'admin@capittal.com'),
  COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'full_name', 'Super Admin')
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin'::admin_role,
  is_active = true,
  updated_at = now();