-- Add l.linares@nrro.es as admin user
-- First, try to get user from auth.users, if exists update admin_users
-- If not exists, we'll need to create through the application

DO $$
DECLARE
    target_user_id uuid;
    admin_email text := 'l.linares@nrro.es';
BEGIN
    -- Check if user exists in auth.users
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = admin_email 
    LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- User exists, add/update admin record
        INSERT INTO public.admin_users (
            user_id, 
            email, 
            full_name,
            role, 
            is_active
        ) VALUES (
            target_user_id, 
            admin_email, 
            'L. Linares',
            'admin', 
            true
        ) ON CONFLICT (user_id) DO UPDATE SET
            role = 'admin',
            is_active = true,
            updated_at = now();
            
        RAISE NOTICE 'Admin user added/updated: %', admin_email;
    ELSE
        -- User doesn't exist in auth, create placeholder admin record
        -- This will be activated when user signs up
        INSERT INTO public.admin_users (
            user_id,
            email, 
            full_name,
            role, 
            is_active
        ) VALUES (
            gen_random_uuid(),
            admin_email, 
            'L. Linares',
            'admin', 
            false  -- Will be activated when user signs up
        );
        
        RAISE NOTICE 'Placeholder admin record created for: %', admin_email;
        RAISE NOTICE 'User will need to sign up to activate their admin access';
    END IF;
    
    -- Log security event
    PERFORM public.log_security_event(
        'ADMIN_USER_ADDED',
        'high',
        'admin_users',
        'add_admin',
        jsonb_build_object(
            'new_admin_email', admin_email,
            'new_admin_role', 'admin',
            'added_by_system', true
        )
    );
END $$;