-- Asegurar RLS y políticas seguras para tool_ratings
-- 1) Habilitar RLS
ALTER TABLE public.tool_ratings ENABLE ROW LEVEL SECURITY;

-- 2) Eliminar políticas existentes para evitar permisos públicos accidentales
DO $do$
DECLARE pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname='public' AND tablename='tool_ratings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.tool_ratings', pol.policyname);
  END LOOP;
END
$do$;

-- 3) Crear políticas nuevas y restrictivas
-- Solo administradores pueden LEER
CREATE POLICY "Admins can view tool ratings"
ON public.tool_ratings
FOR SELECT
USING (current_user_is_admin());

-- Solo administradores pueden ACTUALIZAR
CREATE POLICY "Admins can update tool ratings"
ON public.tool_ratings
FOR UPDATE
USING (current_user_is_admin())
WITH CHECK (current_user_is_admin());

-- Solo administradores pueden BORRAR
CREATE POLICY "Admins can delete tool ratings"
ON public.tool_ratings
FOR DELETE
USING (current_user_is_admin());

-- Cualquiera puede INSERTAR (para permitir enviar valoraciones desde la web sin login)
CREATE POLICY "Anyone can insert tool ratings"
ON public.tool_ratings
FOR INSERT
WITH CHECK (true);
