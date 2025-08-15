-- Agregar columna para capturar fecha y hora de incorporación del formulario
ALTER TABLE public.company_valuations 
ADD COLUMN form_submitted_at timestamp with time zone DEFAULT now();

-- Comentario: Esta columna capturará automáticamente el momento exacto cuando se envía el formulario
COMMENT ON COLUMN public.company_valuations.form_submitted_at IS 'Fecha y hora exacta cuando el usuario envió el formulario de valoración';