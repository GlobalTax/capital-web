-- Modificar trigger para permitir actualizaciones sin sesión de usuario (migraciones/scripts)
CREATE OR REPLACE FUNCTION log_admin_user_changes()
RETURNS trigger AS $$
BEGIN
  -- Solo registrar si hay un usuario autenticado (evitar error en migraciones)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action_type,
      target_user_id,
      target_user_email,
      old_values,
      new_values,
      ip_address,
      user_agent
    ) VALUES (
      auth.uid(),
      TG_OP,
      COALESCE(NEW.user_id, OLD.user_id),
      COALESCE(NEW.email, OLD.email),
      to_jsonb(OLD),
      to_jsonb(NEW),
      inet_client_addr(),
      current_setting('request.headers', true)::json->>'user-agent'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;