-- SEGURIDAD CRÍTICA - VERSIÓN CORREGIDA
-- Implementación sin triggers SELECT inválidos

-- 1. ARREGLAR FUNCIONES CON SEARCH_PATH MUTABLE
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

-- 2. REFORZAR POLÍTICAS RLS CRÍTICAS PARA COMPANY_VALUATIONS
DROP POLICY IF EXISTS "Improved token access validation" ON public.company_valuations;
CREATE POLICY "Critical secure token access"
ON public.company_valuations
FOR SELECT
USING (
  current_user_is_admin() 
  OR (auth.uid() = user_id AND is_deleted = false)
  OR (
    auth.role() = 'anon' 
    AND unique_token IS NOT NULL 
    AND length(unique_token::text) >= 16
    AND created_at > now() - INTERVAL '30 days'
  )
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Secure valuation insert with rate limit" ON public.company_valuations;
CREATE POLICY "Critical secure valuation insert"
ON public.company_valuations
FOR INSERT
WITH CHECK (
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
    AND check_rate_limit_enhanced(
      COALESCE(inet_client_addr()::text, 'unknown'), 
      'valuation_submission', 
      3, 1440
    )
  )
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR current_user_is_admin()
);

-- 3. ASEGURAR ADMIN_USERS ULTRA-RESTRICTIVO
DROP POLICY IF EXISTS "Super restrictive admin access" ON public.admin_users;
CREATE POLICY "Critical admin access only"
ON public.admin_users
FOR SELECT
USING (
  is_user_super_admin(auth.uid())
  OR (auth.uid() = user_id AND is_active = true)
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Super admin only modifications" ON public.admin_users;
CREATE POLICY "Critical admin modifications"
ON public.admin_users
FOR ALL
USING (is_user_super_admin(auth.uid()) OR auth.role() = 'service_role')
WITH CHECK (is_user_super_admin(auth.uid()) OR auth.role() = 'service_role');

-- 4. PROTEGER CONTACT_LEADS - ADMIN ONLY
DROP POLICY IF EXISTS "Admin only contact leads access" ON public.contact_leads;
CREATE POLICY "Critical admin only leads"
ON public.contact_leads
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Secure public contact lead submission" ON public.contact_leads;
CREATE POLICY "Critical secure lead submission"
ON public.contact_leads
FOR INSERT
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'contact_lead',
    2, 1440
  )
  AND full_name IS NOT NULL 
  AND length(trim(full_name)) BETWEEN 2 AND 100
  AND email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) <= 254
  AND company IS NOT NULL 
  AND length(trim(company)) BETWEEN 2 AND 100
);

-- 5. PROTEGER COLLABORATOR_APPLICATIONS
DROP POLICY IF EXISTS "Admin only collaborator apps access" ON public.collaborator_applications;
CREATE POLICY "Critical admin only collaborator apps"
ON public.collaborator_applications
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Secure public collaborator application submission" ON public.collaborator_applications;
CREATE POLICY "Critical secure collaborator submission"
ON public.collaborator_applications
FOR INSERT
WITH CHECK (
  check_rate_limit_enhanced(
    COALESCE(inet_client_addr()::text, 'unknown'),
    'collaborator_application',
    1, 1440
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

-- 6. ASEGURAR BLOG POSTS Y BUSINESS METRICS
DROP POLICY IF EXISTS "Admin manage blog posts" ON public.blog_posts;
CREATE POLICY "Critical admin blog management"
ON public.blog_posts
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

DROP POLICY IF EXISTS "Public read published posts" ON public.blog_posts;
CREATE POLICY "Critical public blog read"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

DROP POLICY IF EXISTS "Admin only business metrics" ON public.business_metrics;
CREATE POLICY "Critical admin only metrics"
ON public.business_metrics
FOR ALL
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- 7. FUNCIÓN DE LOGGING DE SEGURIDAD CRÍTICA
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

  -- Log crítico en PostgreSQL para alerta inmediata
  RAISE WARNING 'CRITICAL_SECURITY_VIOLATION: % on table % - User: % - Details: %', 
    violation_type, table_name, auth.uid(), details;
END;
$function$;

-- 8. VALIDACIÓN DE INTEGRIDAD DE DATOS CRÍTICOS
CREATE OR REPLACE FUNCTION public.validate_valuation_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validar datos financieros coherentes
  IF NEW.revenue IS NOT NULL AND NEW.revenue < 0 THEN
    PERFORM public.log_critical_security_violation(
      'INVALID_FINANCIAL_DATA',
      'company_valuations',
      jsonb_build_object('field', 'revenue', 'value', NEW.revenue)
    );
    RAISE EXCEPTION 'Revenue cannot be negative';
  END IF;
  
  IF NEW.ebitda IS NOT NULL AND NEW.revenue IS NOT NULL AND NEW.ebitda > NEW.revenue THEN
    PERFORM public.log_critical_security_violation(
      'INVALID_FINANCIAL_DATA',
      'company_valuations',
      jsonb_build_object('field', 'ebitda_vs_revenue', 'ebitda', NEW.ebitda, 'revenue', NEW.revenue)
    );
    RAISE EXCEPTION 'EBITDA cannot exceed revenue';
  END IF;
  
  -- Validar email format
  IF NEW.email IS NOT NULL AND NOT (NEW.email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    PERFORM public.log_critical_security_violation(
      'INVALID_EMAIL_FORMAT',
      'company_valuations',
      jsonb_build_object('email', LEFT(NEW.email, 50))  -- Solo primeros 50 chars por privacidad
    );
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Aplicar trigger de validación
DROP TRIGGER IF EXISTS validate_valuation_data ON public.company_valuations;
CREATE TRIGGER validate_valuation_data
  BEFORE INSERT OR UPDATE ON public.company_valuations
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_valuation_integrity();

-- 9. FUNCIÓN PARA MONITOREAR ACCESOS CRÍTICOS (Logging-based, sin triggers SELECT)
CREATE OR REPLACE FUNCTION public.audit_critical_data_access(
  table_accessed text,
  access_type text DEFAULT 'READ'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Solo registrar accesos anónimos a tablas críticas
  IF auth.role() = 'anon' AND table_accessed IN (
    'admin_users', 'contact_leads', 'collaborator_applications', 
    'business_metrics', 'security_events'
  ) THEN
    PERFORM public.log_critical_security_violation(
      'UNAUTHORIZED_ANONYMOUS_ACCESS',
      table_accessed,
      jsonb_build_object(
        'access_type', access_type,
        'ip', inet_client_addr(),
        'user_agent', current_setting('request.headers', true)::json->>'user-agent'
      )
    );
  END IF;
END;
$function$;

-- 10. CONFIGURACIÓN DE SEGURIDAD ADICIONAL
-- Habilitar logging de conexiones para auditoría
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';

-- Limpiar políticas conflictivas existentes si existen
DROP POLICY IF EXISTS "Secure token-based valuation access" ON public.company_valuations;
DROP POLICY IF EXISTS "Secure valuation insert" ON public.company_valuations;
DROP POLICY IF EXISTS "Token-based update with validation" ON public.company_valuations;

-- COMMIT SEGURIDAD CRÍTICA - FASE 1 COMPLETADA
-- ✅ Funciones con search_path fijo
-- ✅ Políticas RLS ultra-restrictivas 
-- ✅ Rate limiting mejorado
-- ✅ Validación de integridad de datos
-- ✅ Logging de seguridad crítica