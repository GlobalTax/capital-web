-- Función de trigger para sincronizar contact_leads con Brevo
CREATE OR REPLACE FUNCTION public.notify_contact_lead_to_brevo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  response_status int;
BEGIN
  -- Enviar datos a la edge function sync-to-brevo
  BEGIN
    SELECT status INTO response_status
    FROM net.http_post(
      url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/sync-to-brevo',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw'
      ),
      body := jsonb_build_object(
        'record', jsonb_build_object(
          'id', NEW.id,
          'email', NEW.email,
          'full_name', NEW.full_name,
          'company', NEW.company,
          'phone', NEW.phone,
          'sectors_of_interest', NEW.sectors_of_interest,
          'company_size', NEW.company_size,
          'utm_source', NEW.utm_source,
          'utm_medium', NEW.utm_medium,
          'utm_campaign', NEW.utm_campaign,
          'utm_term', NEW.utm_term,
          'utm_content', NEW.utm_content,
          'status', NEW.status,
          'created_at', NEW.created_at
        ),
        'table', 'contact_leads',
        'type', 'INSERT'
      )
    ) AS status;
    
    -- Registrar éxito en logs
    RAISE LOG 'Contacto % enviado a Brevo con status %', NEW.id, response_status;
    
  EXCEPTION WHEN OTHERS THEN
    -- No fallar el INSERT si falla el envío a Brevo
    RAISE LOG 'Error enviando contacto % a Brevo: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Crear trigger en contact_leads
DROP TRIGGER IF EXISTS trg_contact_leads_brevo ON public.contact_leads;

CREATE TRIGGER trg_contact_leads_brevo
  AFTER INSERT ON public.contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_contact_lead_to_brevo();