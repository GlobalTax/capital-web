-- Update admin roles with correct user IDs

-- Configure s.navarro@obn.es as super_admin
INSERT INTO public.admin_users (
  user_id, 
  email, 
  full_name, 
  role, 
  is_active
) VALUES (
  '5e522cb6-3c32-4585-b564-d2e50ca67196'::uuid,
  's.navarro@obn.es',
  'Samuel Navarro',
  'super_admin',
  true
) ON CONFLICT (user_id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Promote lluis@capittal.es to admin
UPDATE public.admin_users 
SET 
  role = 'admin',
  updated_at = now()
WHERE user_id = '5403772d-92b6-4e35-8ea1-b6d5c3b22113'::uuid
  AND is_active = true;