-- FASE 8 - MIGRACIÓN 1: Asegurar funciones SECURITY DEFINER críticas
-- Agregar SET search_path a 5 funciones trigger con SECURITY DEFINER

-- 1. increment_document_download_count
CREATE OR REPLACE FUNCTION public.increment_document_download_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.documents
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = NEW.document_id;
  RETURN NEW;
END;
$function$;

-- 2. increment_job_application_count
CREATE OR REPLACE FUNCTION public.increment_job_application_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.job_posts 
  SET application_count = application_count + 1 
  WHERE id = NEW.job_post_id;
  RETURN NEW;
END;
$function$;

-- 3. log_application_status_change
CREATE OR REPLACE FUNCTION public.log_application_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.job_application_activities (
      application_id,
      activity_type,
      description,
      performed_by,
      metadata
    ) VALUES (
      NEW.id,
      'status_change',
      'Estado cambiado de ' || OLD.status || ' a ' || NEW.status,
      NEW.reviewed_by,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. send_booking_notification
CREATE OR REPLACE FUNCTION public.send_booking_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-booking-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6YWZpY2oiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ5ODI3OTUzLCJleHAiOjIwNjU0MDM5NTN9.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw'
      ),
      body := jsonb_build_object(
        'bookingId', NEW.id,
        'clientName', NEW.client_name,
        'clientEmail', NEW.client_email,
        'clientPhone', NEW.client_phone,
        'companyName', NEW.company_name,
        'bookingDate', NEW.booking_date,
        'bookingTime', NEW.booking_time,
        'meetingType', NEW.meeting_type,
        'notes', NEW.notes
      )
    );
  
  RETURN NEW;
END;
$function$;

-- 5. trigger_sync_contact_to_brevo
CREATE OR REPLACE FUNCTION public.trigger_sync_contact_to_brevo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.brevo_sync_log (entity_type, entity_id, sync_status)
  VALUES ('contact', NEW.id, 'pending')
  ON CONFLICT DO NOTHING;

  PERFORM
    net.http_post(
      url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/sync-to-brevo',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claims', true)::json->>'token'
      ),
      body := jsonb_build_object(
        'type', 'contact',
        'id', NEW.id::text,
        'data', jsonb_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'nombre', NEW.nombre,
          'apellidos', NEW.apellidos,
          'telefono', NEW.telefono,
          'cargo', NEW.cargo,
          'linkedin', NEW.linkedin,
          'empresa_principal_id', NEW.empresa_principal_id
        )
      )
    );
  
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.increment_document_download_count() IS 
'SECURITY: Hardened with SET search_path to prevent search_path poisoning attacks (Phase 8)';

COMMENT ON FUNCTION public.increment_job_application_count() IS 
'SECURITY: Hardened with SET search_path to prevent search_path poisoning attacks (Phase 8)';

COMMENT ON FUNCTION public.log_application_status_change() IS 
'SECURITY: Hardened with SET search_path to prevent search_path poisoning attacks (Phase 8)';

COMMENT ON FUNCTION public.send_booking_notification() IS 
'SECURITY: Hardened with SET search_path to prevent search_path poisoning attacks (Phase 8)';

COMMENT ON FUNCTION public.trigger_sync_contact_to_brevo() IS 
'SECURITY: Hardened with SET search_path to prevent search_path poisoning attacks (Phase 8)';