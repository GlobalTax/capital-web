-- Crear usuario admin para Lucía directamente
INSERT INTO public.admin_users (
  user_id,
  email, 
  full_name,
  role,
  is_active
) VALUES (
  gen_random_uuid(),  -- UUID temporal hasta que se registre
  'l.linares@nrro.es',
  'Lucía',
  'admin',
  true
);