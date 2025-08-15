-- Arreglar los warnings de seguridad para las funciones creadas

-- 1. Arreglar la función send_incomplete_valuation_alert con search_path
CREATE OR REPLACE FUNCTION send_incomplete_valuation_alert()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  function_url text;
BEGIN
  -- Solo procesar si es un INSERT y la valoración está incompleta
  IF TG_OP = 'INSERT' AND NEW.final_valuation IS NULL THEN
    -- Construir URL de la función edge
    function_url := 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/send-incomplete-alert';
    
    -- Llamar a la función edge de forma asíncrona usando pg_net
    PERFORM
      net.http_post(
        url := function_url,
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTgyNzk1MywiZXhwIjoyMDY1NDAzOTUzfQ.3X4qOZrE7yx6bJqLKGVo4oQlBYgVxgYIz9m9YIK7pDw' || 
                   '"}'::jsonb,
        body := json_build_object('valuationId', NEW.id)::jsonb
      );
    
    -- Log para debugging
    RAISE LOG 'Enviando alerta para valoración incompleta: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;