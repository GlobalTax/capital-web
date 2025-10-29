-- FASE 8 - MIGRACIÓN 7: Arreglar funciones restantes sin search_path
-- Best practice: Agregar SET search_path a funciones SECURITY INVOKER

-- 1. update_job_templates_updated_at
CREATE OR REPLACE FUNCTION public.update_job_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. update_lead_task_updated_at
CREATE OR REPLACE FUNCTION public.update_lead_task_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. update_mandato_documentos_updated_at
CREATE OR REPLACE FUNCTION public.update_mandato_documentos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 4. update_news_search_vector
CREATE OR REPLACE FUNCTION public.update_news_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$function$;

-- 5. update_portfolio_search_vector
CREATE OR REPLACE FUNCTION public.update_portfolio_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', COALESCE(NEW.company_name, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.industry, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$function$;

-- 6. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 7. update_updated_at_portfolio
CREATE OR REPLACE FUNCTION public.update_updated_at_portfolio()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Comentarios de seguridad
COMMENT ON FUNCTION public.update_job_templates_updated_at() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.update_lead_task_updated_at() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.update_mandato_documentos_updated_at() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.update_news_search_vector() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.update_portfolio_search_vector() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';

COMMENT ON FUNCTION public.update_updated_at_portfolio() IS 
'SECURITY: Hardened with SET search_path as best practice (Phase 8)';