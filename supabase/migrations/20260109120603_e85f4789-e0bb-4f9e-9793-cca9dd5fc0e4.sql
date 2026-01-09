-- Crear alias para gen_random_bytes para compatibilidad con código legacy
-- que no usa el prefijo extensions.
CREATE OR REPLACE FUNCTION public.gen_random_bytes(integer)
RETURNS bytea
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT extensions.gen_random_bytes($1);
$$;

-- Añadir comentario explicativo
COMMENT ON FUNCTION public.gen_random_bytes(integer) IS 'Alias para extensions.gen_random_bytes() para compatibilidad con código legacy';