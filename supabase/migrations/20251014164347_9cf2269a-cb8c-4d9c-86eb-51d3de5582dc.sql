-- Función RPC bypass para crear usuarios sin validación de email de Supabase Auth
-- Esta función inserta directamente en auth.users y bypasea las validaciones de dominio de email
CREATE OR REPLACE FUNCTION public.create_temporary_user_bypass(
  p_email TEXT,
  p_full_name TEXT,
  p_role admin_role DEFAULT 'editor'::admin_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_temp_password TEXT;
  v_password_hash TEXT;
BEGIN
  -- Solo super admins pueden crear usuarios
  IF NOT is_user_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo los super administradores pueden crear usuarios';
  END IF;
  
  -- Validar email básico
  IF NOT (p_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  
  -- Generar contraseña temporal segura (20 caracteres)
  v_temp_password := encode(extensions.gen_random_bytes(15), 'base64');
  v_temp_password := replace(v_temp_password, '/', 'A');
  v_temp_password := replace(v_temp_password, '+', 'B');
  v_temp_password := replace(v_temp_password, '=', 'C');
  v_temp_password := v_temp_password || '1!'; -- Asegurar complejidad
  
  -- Generar hash de contraseña usando bcrypt
  v_password_hash := crypt(v_temp_password, gen_salt('bf'));
  
  -- Insertar directamente en auth.users (bypass de validaciones de email)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    v_password_hash,
    NOW(), -- Email pre-confirmado
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('full_name', p_full_name),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_user_id;
  
  -- Crear registro en admin_users
  INSERT INTO public.admin_users (
    user_id,
    email,
    full_name,
    role,
    is_active,
    needs_credentials
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_role,
    true,
    true
  );
  
  -- Log de seguridad
  PERFORM public.log_security_event(
    'USER_CREATED_BY_ADMIN_BYPASS',
    'high',
    'admin_users',
    'create_user_bypass',
    jsonb_build_object(
      'created_user_email', p_email,
      'created_user_role', p_role,
      'created_by', auth.uid(),
      'method', 'bypass_email_validation'
    )
  );
  
  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'email', p_email,
    'temporary_password', v_temp_password,
    'requires_password_change', true,
    'method', 'bypass'
  );
END;
$$;

-- Comentario sobre uso
COMMENT ON FUNCTION public.create_temporary_user_bypass IS 
'Función de emergencia para crear usuarios cuando Supabase Auth rechaza el dominio de email. 
Bypasea validaciones de email insertando directamente en auth.users. 
Solo accesible por super_admin.';
