-- Update admin roles: Configure s.navarro@obn.es as super_admin and promote lluis@capittal.es

-- First, update or insert s.navarro@obn.es as super_admin
INSERT INTO public.admin_users (
  user_id, 
  email, 
  full_name, 
  role, 
  is_active
) VALUES (
  '9d22df4d-465b-4f8f-8079-486817b08043'::uuid,
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

-- Update lluis@capittal.es from editor to admin
UPDATE public.admin_users 
SET 
  role = 'admin',
  updated_at = now()
WHERE email = 'lluis@capittal.es'
  AND is_active = true;