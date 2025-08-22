-- Crear tabla para solicitudes de registro pendientes
CREATE TABLE public.user_registration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_registration_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Los usuarios pueden ver su propia solicitud" 
ON public.user_registration_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Los admins pueden ver todas las solicitudes" 
ON public.user_registration_requests 
FOR SELECT 
USING (current_user_is_admin());

CREATE POLICY "Los admins pueden actualizar solicitudes" 
ON public.user_registration_requests 
FOR UPDATE 
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

CREATE POLICY "Sistema puede insertar solicitudes" 
ON public.user_registration_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_registration_requests_updated_at
BEFORE UPDATE ON public.user_registration_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para aprobar solicitud de registro
CREATE OR REPLACE FUNCTION public.approve_user_registration(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record RECORD;
  admin_record RECORD;
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT current_user_is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden aprobar solicitudes';
  END IF;
  
  -- Obtener la solicitud
  SELECT * INTO request_record 
  FROM public.user_registration_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada o ya procesada';
  END IF;
  
  -- Obtener información del admin que aprueba
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  -- Crear el registro de usuario admin
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
  
  -- Actualizar la solicitud
  UPDATE public.user_registration_requests 
  SET 
    status = 'approved',
    processed_at = now(),
    processed_by = auth.uid(),
    updated_at = now()
  WHERE id = request_id;
  
  -- Log de auditoría
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
$$;

-- Función para rechazar solicitud de registro
CREATE OR REPLACE FUNCTION public.reject_user_registration(request_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record RECORD;
  admin_record RECORD;
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT current_user_is_admin() THEN
    RAISE EXCEPTION 'Solo los administradores pueden rechazar solicitudes';
  END IF;
  
  -- Obtener la solicitud
  SELECT * INTO request_record 
  FROM public.user_registration_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada o ya procesada';
  END IF;
  
  -- Obtener información del admin que rechaza
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  -- Actualizar la solicitud
  UPDATE public.user_registration_requests 
  SET 
    status = 'rejected',
    processed_at = now(),
    processed_by = auth.uid(),
    rejection_reason = reason,
    updated_at = now()
  WHERE id = request_id;
  
  -- Log de auditoría
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
$$;