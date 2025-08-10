-- Mover pgcrypto a schema "extensions" y actualizar funciones que lo usan
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pgcrypto SET SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.generate_unique_v4_token()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(extensions.gen_random_bytes(16), 'hex');
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_unique_proposal_url()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  unique_string TEXT;
BEGIN
  unique_string := encode(extensions.gen_random_bytes(16), 'hex');
  RETURN unique_string;
END;
$function$;