-- Promover Oriol a Super Admin
UPDATE public.admin_users 
SET role = 'super_admin', updated_at = now()
WHERE email = 'oriol@capittal.es';