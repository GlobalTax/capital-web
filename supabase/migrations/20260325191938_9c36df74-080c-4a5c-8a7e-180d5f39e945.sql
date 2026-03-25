CREATE OR REPLACE FUNCTION public.get_active_admin_users()
RETURNS TABLE(user_id UUID, full_name TEXT, email TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.user_id, au.full_name, au.email
  FROM admin_users au
  WHERE au.is_active = true
  ORDER BY au.full_name;
$$;