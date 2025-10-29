-- =====================================================
-- FASE 6: DATABASE HARDENING - FUNCTION SECURITY
-- =====================================================
-- Corregir funciones sin SET search_path (vulnerables a poisoning)
-- Asegurar Security Definer functions

-- 1. CRÍTICO: Añadir SET search_path a funciones sin protección
-- Función: approve_user_registration
CREATE OR REPLACE FUNCTION public.approve_user_registration(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- AÑADIDO PARA SEGURIDAD
AS $function$
DECLARE
  request_record RECORD;
  admin_record RECORD;
BEGIN
  IF NOT current_user_is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden aprobar solicitudes';
  END IF;
  
  SELECT * INTO request_record 
  FROM public.user_registration_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada o ya procesada';
  END IF;
  
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  INSERT INTO public.admin_users (
    user_id, 
    email, 
    full_name, 
    role, 
    is_active
  ) VALUES (
    request_record.user_id,
    request_record.email,
    request_record.full_name,
    'editor',
    true
  ) ON CONFLICT (user_id) DO UPDATE SET
    is_active = true,
    role = COALESCE(admin_users.role, 'editor'::admin_role),
    updated_at = now();
  
  UPDATE public.user_registration_requests 
  SET 
    status = 'approved',
    processed_at = now(),
    processed_by = auth.uid(),
    updated_at = now()
  WHERE id = request_id;
  
  PERFORM public.log_security_event(
    'USER_REGISTRATION_APPROVED',
    'high',
    'user_registration_requests',
    'approve_registration',
    jsonb_build_object(
      'request_id', request_id,
      'approved_user_id', request_record.user_id,
      'approved_user_email', request_record.email,
      'approved_by', auth.uid(),
      'approved_by_email', admin_record.email
    )
  );
  
  RETURN true;
END;
$function$;

-- Función: reject_user_registration
CREATE OR REPLACE FUNCTION public.reject_user_registration(request_id uuid, reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- AÑADIDO PARA SEGURIDAD
AS $function$
DECLARE
  request_record RECORD;
  admin_record RECORD;
BEGIN
  IF NOT current_user_is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden rechazar solicitudes';
  END IF;
  
  SELECT * INTO request_record 
  FROM public.user_registration_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada o ya procesada';
  END IF;
  
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  UPDATE public.user_registration_requests 
  SET 
    status = 'rejected',
    processed_at = now(),
    processed_by = auth.uid(),
    rejection_reason = reason,
    updated_at = now()
  WHERE id = request_id;
  
  PERFORM public.log_security_event(
    'USER_REGISTRATION_REJECTED',
    'medium',
    'user_registration_requests',
    'reject_registration',
    jsonb_build_object(
      'request_id', request_id,
      'rejected_user_id', request_record.user_id,
      'rejected_user_email', request_record.email,
      'rejected_by', auth.uid(),
      'rejected_by_email', admin_record.email,
      'reason', reason
    )
  );
  
  RETURN true;
END;
$function$;

-- Función: create_temporary_user
CREATE OR REPLACE FUNCTION public.create_temporary_user(p_email text, p_full_name text, p_role admin_role DEFAULT 'editor'::admin_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- AÑADIDO PARA SEGURIDAD
AS $function$
DECLARE
  new_user_id uuid;
  temp_password text;
  result_data jsonb;
BEGIN
  IF NOT is_user_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo los super administradores pueden crear usuarios';
  END IF;
  
  IF NOT (p_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  
  temp_password := encode(extensions.gen_random_bytes(15), 'base64');
  temp_password := replace(temp_password, '/', 'A');
  temp_password := replace(temp_password, '+', 'B');
  temp_password := replace(temp_password, '=', 'C');
  temp_password := temp_password || '1!';
  
  new_user_id := gen_random_uuid();
  
  INSERT INTO public.admin_users (
    user_id,
    email,
    full_name,
    role,
    is_active
  ) VALUES (
    new_user_id,
    p_email,
    p_full_name,
    p_role,
    false
  );
  
  PERFORM public.log_security_event(
    'USER_CREATED_BY_ADMIN',
    'high',
    'admin_users',
    'create_user',
    jsonb_build_object(
      'created_user_email', p_email,
      'created_user_role', p_role,
      'created_by', auth.uid()
    )
  );
  
  result_data := jsonb_build_object(
    'user_id', new_user_id,
    'email', p_email,
    'temporary_password', temp_password,
    'requires_password_change', true
  );
  
  RETURN result_data;
END;
$function$;

-- Función: rollback_import
CREATE OR REPLACE FUNCTION public.rollback_import(p_import_log_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- AÑADIDO PARA SEGURIDAD
AS $function$
DECLARE
  deleted_mandatos INTEGER := 0;
  deleted_contactos INTEGER := 0;
  deleted_empresas INTEGER := 0;
BEGIN
  IF NOT current_user_is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden hacer rollback de importaciones';
  END IF;
  
  UPDATE public.mandatos
  SET is_deleted = true, deleted_at = now(), deleted_by = auth.uid()
  WHERE import_log_id = p_import_log_id AND is_deleted = false;
  GET DIAGNOSTICS deleted_mandatos = ROW_COUNT;
  
  UPDATE public.contactos
  SET is_deleted = true, deleted_at = now(), deleted_by = auth.uid()
  WHERE import_log_id = p_import_log_id AND is_deleted = false;
  GET DIAGNOSTICS deleted_contactos = ROW_COUNT;
  
  UPDATE public.empresas
  SET is_deleted = true, deleted_at = now(), deleted_by = auth.uid()
  WHERE import_log_id = p_import_log_id AND is_deleted = false;
  GET DIAGNOSTICS deleted_empresas = ROW_COUNT;
  
  UPDATE public.import_logs
  SET status = 'cancelled', completed_at = now()
  WHERE id = p_import_log_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_mandatos', deleted_mandatos,
    'deleted_contactos', deleted_contactos,
    'deleted_empresas', deleted_empresas
  );
END;
$function$;

-- Función: update_kanban_order
CREATE OR REPLACE FUNCTION public.update_kanban_order(updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- AÑADIDO PARA SEGURIDAD
AS $function$
DECLARE
  update_item JSONB;
BEGIN
  IF NOT current_user_is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden reordenar fases';
  END IF;

  FOR update_item IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    UPDATE public.mandato_kanban_config
    SET orden = (update_item->>'orden')::INTEGER,
        updated_at = now()
    WHERE id = (update_item->>'id')::UUID;
  END LOOP;
END;
$function$;

-- 2. Comentarios de seguridad en funciones críticas
COMMENT ON FUNCTION public.approve_user_registration(uuid) IS 
'SECURITY HARDENED: Protected against search_path poisoning with explicit SET search_path = public';

COMMENT ON FUNCTION public.reject_user_registration(uuid, text) IS 
'SECURITY HARDENED: Protected against search_path poisoning with explicit SET search_path = public';

COMMENT ON FUNCTION public.create_temporary_user(text, text, admin_role) IS 
'SECURITY HARDENED: Protected against search_path poisoning with explicit SET search_path = public';

COMMENT ON FUNCTION public.rollback_import(uuid) IS 
'SECURITY HARDENED: Protected against search_path poisoning with explicit SET search_path = public';

COMMENT ON FUNCTION public.update_kanban_order(jsonb) IS 
'SECURITY HARDENED: Protected against search_path poisoning with explicit SET search_path = public';