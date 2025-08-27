-- Bootstrap the admin user directly
DO $$
BEGIN
    -- Insert the admin user record
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
    )
    ON CONFLICT (email) DO UPDATE SET
        role = 'admin'::admin_role,
        is_active = EXCLUDED.is_active,
        updated_at = now();

    -- Log the action
    PERFORM public.log_security_event(
        'ADMIN_USER_BOOTSTRAPPED',
        'high',
        'admin_users',
        'bootstrap_admin',
        jsonb_build_object(
            'admin_email', 'l.linares@nrro.es',
            'admin_role', 'admin',
            'requires_signup', true
        )
    );
    
    RAISE NOTICE 'Admin user l.linares@nrro.es added successfully. User needs to sign up to activate admin access.';
END $$;