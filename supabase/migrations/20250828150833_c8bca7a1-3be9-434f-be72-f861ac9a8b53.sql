-- SEGURIDAD CRÍTICA: Arreglar vulnerabilidades detectadas por el linter

-- 1. Arreglar search_path mutable en funciones sin SET search_path
-- Estas funciones necesitan search_path fijo para evitar ataques de manipulación de esquema

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Función para generar número de propuesta
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_year TEXT;
  sequence_num TEXT;
  proposal_number TEXT;
BEGIN
  current_year := EXTRACT(year FROM now())::TEXT;
  
  SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0') INTO sequence_num
  FROM public.fee_proposals 
  WHERE EXTRACT(year FROM created_at) = EXTRACT(year FROM now());
  
  proposal_number := 'PROP-' || current_year || '-' || sequence_num;
  
  RETURN proposal_number;
END;
$function$;

-- Función para generar URL única de propuesta
CREATE OR REPLACE FUNCTION public.generate_unique_proposal_url()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  unique_string TEXT;
BEGIN
  unique_string := encode(extensions.gen_random_bytes(16), 'hex');
  RETURN unique_string;
END;
$function$;

-- 2. REFORZAR POLÍTICAS RLS CRÍTICAS

-- Asegurar que company_valuations tiene políticas restrictivas mejoradas
DROP POLICY IF EXISTS "Improved token access validation" ON public.company_valuations;
CREATE POLICY "Improved token access validation"
ON public.company_valuations
FOR SELECT
USING (
  -- Solo admins, usuarios propietarios, o acceso con token válido y reciente
  current_user_is_admin() 
  OR (auth.uid() = user_id AND is_deleted = false)
  OR (
    auth.role() = 'anon' 
    AND unique_token IS NOT NULL 
    AND length(unique_token::text) >= 16
    AND created_at > now() - INTERVAL '30 days' -- Token expira en 30 días
  )
  OR auth.role() = 'service_role'
);

-- Mejorar política de inserción para evitar spam
DROP POLICY IF EXISTS "Secure valuation insert with rate limit" ON public.company_valuations;
CREATE POLICY "Secure valuation insert with rate limit"
ON public.company_valuations
FOR INSERT
WITH CHECK (
  -- Validaciones estrictas para inserciones
  (
    auth.role() = 'anon' 
    AND unique_token IS NOT NULL
    AND contact_name IS NOT NULL 
    AND length(trim(contact_name)) >= 2
    AND company_name IS NOT NULL 
    AND length(trim(company_name)) >= 2
    AND email IS NOT NULL 
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND industry IS NOT NULL 
    AND employee_range IS NOT NULL
    -- Rate limiting por IP
    AND check_rate_limit_enhanced(
      COALESCE(inet_client_addr()::text, 'unknown'), 
      'valuation_submission', 
      3, -- máximo 3 por día
      1440 -- ventana de 24 horas
    )
  )
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR current_user_is_admin()
);

-- 3. PROTEGER TABLAS DE ADMINISTRACIÓN

-- Asegurar admin_users tiene acceso ultra-restrictivo
DROP POLICY IF EXISTS "Super restrictive admin access" ON public.admin_users;
CREATE POLICY "Super restrictive admin access"
ON public.admin_users
FOR SELECT
USING (
  -- Solo super admins pueden ver otros admins, usuarios pueden verse a sí mismos
  is_user_super_admin(auth.uid())
  OR (auth.uid() = user_id AND is_active = true)
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Super admin only modifications" ON public.admin_users;
CREATE POLICY "Super admin only modifications"
ON public.admin_users
FOR ALL
USING (is_user_super_admin(auth.uid()) OR auth.role() = 'service_role')
WITH CHECK (is_user_super_admin(auth.uid()) OR auth.role() = 'service_role');

-- 4. PROTEGER DATOS SENSIBLES DE LEADS Y CONTACTOS

-- Asegurar contact_leads solo para admins
DROP POLICY IF EXISTS "Admin only contact leads access" ON public.contact_leads;
CREATE POLICY "Admin only contact leads access"
ON public.contact_leads
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Política restrictiva para inserción de leads (solo con rate limiting)
DROP POLICY IF EXISTS "Secure public contact lead submission" ON public.contact_leads;
CREATE POLICY "Secure public contact lead submission"
ON public.contact_leads
FOR INSERT
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'contact_lead',
    2, -- máximo 2 por día
    1440
  )
  AND full_name IS NOT NULL 
  AND length(trim(full_name)) BETWEEN 2 AND 100
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND company IS NOT NULL 
  AND length(trim(company)) BETWEEN 2 AND 100
);

-- 5. PROTEGER APLICACIONES DE COLABORADORES

DROP POLICY IF EXISTS "Admin only collaborator apps access" ON public.collaborator_applications;
CREATE POLICY "Admin only collaborator apps access"
ON public.collaborator_applications
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Política restrictiva para inserción de aplicaciones
DROP POLICY IF EXISTS "Secure public collaborator application submission" ON public.collaborator_applications;
CREATE POLICY "Secure public collaborator application submission"
ON public.collaborator_applications
FOR INSERT
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'collaborator_application',
    1, -- máximo 1 por día
    1440
  )
  AND full_name IS NOT NULL 
  AND length(trim(full_name)) BETWEEN 2 AND 100
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND phone IS NOT NULL 
  AND profession IS NOT NULL 
  AND length(trim(profession)) BETWEEN 2 AND 100
);

-- 6. ASEGURAR CONFIGURACIONES DEL SISTEMA

-- Blog posts - solo admins pueden gestionar
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage blog posts" ON public.blog_posts;
CREATE POLICY "Admin manage blog posts"
ON public.blog_posts
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Public read published posts" ON public.blog_posts;
CREATE POLICY "Public read published posts"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

-- Métricas de negocio - solo admins
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin only business metrics" ON public.business_metrics;
CREATE POLICY "Admin only business metrics"
ON public.business_metrics
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- 7. LOGGING DE SEGURIDAD MEJORADO

-- Función para registrar eventos de seguridad críticos
CREATE OR REPLACE FUNCTION public.log_critical_security_violation(
  violation_type text,
  table_name text,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log inmediato para violaciones críticas
  INSERT INTO public.security_events (
    event_type,
    severity,
    user_id,
    ip_address,
    table_name,
    action_attempted,
    details
  ) VALUES (
    violation_type,
    'critical',
    auth.uid(),
    inet_client_addr(),
    table_name,
    'SECURITY_VIOLATION',
    jsonb_build_object(
      'timestamp', now(),
      'user_role', auth.role(),
      'violation_details', details
    )
  );

  -- Log crítico en PostgreSQL
  RAISE WARNING 'CRITICAL_SECURITY_VIOLATION: % on table % - User: % - Details: %', 
    violation_type, table_name, auth.uid(), details;
END;
$function$;

-- 8. TRIGGER PARA DETECTAR ACCESOS SOSPECHOSOS

CREATE OR REPLACE FUNCTION public.monitor_suspicious_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Detectar intentos de acceso anónimo a datos sensibles
  IF auth.role() = 'anon' AND TG_TABLE_NAME IN (
    'admin_users', 'contact_leads', 'collaborator_applications', 
    'business_metrics', 'security_events'
  ) THEN
    PERFORM public.log_critical_security_violation(
      'UNAUTHORIZED_ANONYMOUS_ACCESS',
      TG_TABLE_NAME,
      jsonb_build_object(
        'ip', inet_client_addr(),
        'user_agent', current_setting('request.headers', true)::json->>'user-agent'
      )
    );
  END IF;
  
  RETURN NULL; -- Para AFTER triggers
END;
$function$;

-- Aplicar trigger a tablas sensibles
CREATE TRIGGER suspicious_access_monitor_admin_users
  AFTER SELECT ON public.admin_users
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.monitor_suspicious_access();

CREATE TRIGGER suspicious_access_monitor_contact_leads
  AFTER SELECT ON public.contact_leads
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.monitor_suspicious_access();

CREATE TRIGGER suspicious_access_monitor_collaborator_applications
  AFTER SELECT ON public.collaborator_applications
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.monitor_suspicious_access();

-- 9. VALIDACIÓN DE INTEGRIDAD DE DATOS

-- Trigger para validar datos críticos en company_valuations
CREATE OR REPLACE FUNCTION public.validate_valuation_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validar que los datos financieros sean coherentes
  IF NEW.revenue IS NOT NULL AND NEW.revenue < 0 THEN
    RAISE EXCEPTION 'Revenue cannot be negative';
  END IF;
  
  IF NEW.ebitda IS NOT NULL AND NEW.revenue IS NOT NULL AND NEW.ebitda > NEW.revenue THEN
    RAISE EXCEPTION 'EBITDA cannot exceed revenue';
  END IF;
  
  -- Validar email format
  IF NEW.email IS NOT NULL AND NOT (NEW.email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_valuation_data
  BEFORE INSERT OR UPDATE ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_valuation_integrity();

-- COMMIT DE SEGURIDAD CRÍTICA COMPLETADO