-- Promote lluis@capittal.es to super_admin
UPDATE public.admin_users 
SET 
  role = 'super_admin',
  updated_at = now()
WHERE user_id = '5403772d-92b6-4e35-8ea1-b6d5c3b22113'::uuid
  AND email = 'lluis@capittal.es'
  AND is_active = true;