-- ===== MIGRACIÓN 5: Funciones de Gestión de Roles RH =====

-- Función para asignar rol RH (solo super admins)
CREATE OR REPLACE FUNCTION public.grant_rh_role(
  target_user_id uuid,
  target_role rh_role,
  notes_text text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Verificar que quien ejecuta sea super admin
  IF NOT is_user_super_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can grant RH roles'
    );
  END IF;

  -- Verificar que el usuario objetivo existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;

  -- Insertar o actualizar rol
  INSERT INTO public.rh_user_roles (user_id, role, granted_by, notes)
  VALUES (target_user_id, target_role, auth.uid(), notes_text)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    granted_by = auth.uid(),
    granted_at = now(),
    notes = notes_text;

  -- Log de seguridad
  PERFORM log_security_event(
    'RH_ROLE_GRANTED',
    'high',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'role', target_role,
      'granted_by', auth.uid()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'RH role granted successfully'
  );
END;
$$;

-- Función para revocar rol RH
CREATE OR REPLACE FUNCTION public.revoke_rh_role(
  target_user_id uuid,
  target_role rh_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_user_super_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only super admins can revoke RH roles'
    );
  END IF;

  DELETE FROM public.rh_user_roles
  WHERE user_id = target_user_id AND role = target_role;

  PERFORM log_security_event(
    'RH_ROLE_REVOKED',
    'high',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'role', target_role,
      'revoked_by', auth.uid()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'RH role revoked successfully'
  );
END;
$$;