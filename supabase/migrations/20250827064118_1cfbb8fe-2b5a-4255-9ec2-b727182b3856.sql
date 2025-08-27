-- Simply insert the admin user record
INSERT INTO public.admin_users (
    user_id,
    email, 
    full_name,
    role, 
    is_active
) VALUES (
    gen_random_uuid(),
    'l.linares@nrro.es', 
    'L. Linares',
    'admin'::admin_role, 
    false  -- Will be activated when user signs up and links their account
);