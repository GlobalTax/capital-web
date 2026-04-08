
DROP FUNCTION IF EXISTS public.get_active_admin_users();

CREATE FUNCTION public.get_active_admin_users()
RETURNS TABLE(user_id UUID, full_name TEXT, email TEXT, phone TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT au.user_id, au.full_name, au.email, au.phone
  FROM admin_users au
  WHERE au.is_active = true
  ORDER BY au.full_name;
$$;

UPDATE public.admin_users SET phone = '+34 653 999 023' WHERE email = 'jan@capittal.es';
UPDATE public.admin_users SET phone = '+34 687 238 036' WHERE email = 'marcc@capittal.es';
UPDATE public.admin_users SET phone = '+34 658 799 614' WHERE email = 'lluis@capittal.es';
UPDATE public.admin_users SET phone = '+34 653 374 569' WHERE email = 'oriol@capittal.es';
