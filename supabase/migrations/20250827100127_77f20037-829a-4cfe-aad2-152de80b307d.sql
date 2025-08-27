-- Crear usuario admin para Lucía
INSERT INTO public.admin_users (
  user_id,
  email, 
  full_name,
  role,
  is_active
) VALUES (
  gen_random_uuid(),  -- Genera un UUID temporal hasta que se registre
  'l.linares@nrro.es',
  'Lucía',
  'admin',
  true
) ON CONFLICT (email) DO UPDATE SET
  full_name = 'Lucía',
  updated_at = now();