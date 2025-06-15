
-- Modificar las políticas RLS de la tabla company_valuations para permitir inserción anónima
-- Primero, eliminar las políticas existentes si las hay
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.company_valuations;

-- Crear nueva política que permite inserción anónima
CREATE POLICY "Enable insert for anonymous users" 
ON public.company_valuations 
FOR INSERT 
WITH CHECK (true);

-- Crear política que permite lectura anónima (opcional, para consultas futuras)
DROP POLICY IF EXISTS "Enable read for anonymous users" ON public.company_valuations;
CREATE POLICY "Enable read for anonymous users" 
ON public.company_valuations 
FOR SELECT 
USING (true);

-- Asegurar que RLS esté habilitado en la tabla
ALTER TABLE public.company_valuations ENABLE ROW LEVEL SECURITY;
