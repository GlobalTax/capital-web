-- Crear tabla para historial de reportes diarios de valoraciones incompletas
CREATE TABLE public.daily_incomplete_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  incomplete_count INTEGER NOT NULL DEFAULT 0,
  incomplete_valuations JSONB NOT NULL DEFAULT '[]'::jsonb,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_id TEXT,
  email_subject TEXT,
  report_status TEXT NOT NULL DEFAULT 'pending' CHECK (report_status IN ('pending', 'success', 'error')),
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.daily_incomplete_reports ENABLE ROW LEVEL SECURITY;

-- Política para que solo administradores puedan ver los reportes
CREATE POLICY "Admins can view daily reports" 
ON public.daily_incomplete_reports 
FOR SELECT 
USING (current_user_is_admin());

-- Política para que solo administradores puedan gestionar los reportes
CREATE POLICY "Admins can manage daily reports" 
ON public.daily_incomplete_reports 
FOR ALL 
USING (current_user_is_admin());

-- Política para que el sistema pueda insertar reportes
CREATE POLICY "System can insert daily reports" 
ON public.daily_incomplete_reports 
FOR INSERT 
WITH CHECK (true);

-- Crear índice en la fecha del reporte para consultas rápidas
CREATE INDEX idx_daily_incomplete_reports_date ON public.daily_incomplete_reports(report_date DESC);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_daily_incomplete_reports_updated_at
BEFORE UPDATE ON public.daily_incomplete_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.daily_incomplete_reports IS 'Historial de reportes diarios de valoraciones incompletas';
COMMENT ON COLUMN public.daily_incomplete_reports.report_date IS 'Fecha del reporte (día para el cual se analiza)';
COMMENT ON COLUMN public.daily_incomplete_reports.period_start IS 'Inicio del período analizado';
COMMENT ON COLUMN public.daily_incomplete_reports.period_end IS 'Fin del período analizado';
COMMENT ON COLUMN public.daily_incomplete_reports.incomplete_count IS 'Número de valoraciones incompletas encontradas';
COMMENT ON COLUMN public.daily_incomplete_reports.incomplete_valuations IS 'Array JSON con detalles de las valoraciones incompletas';
COMMENT ON COLUMN public.daily_incomplete_reports.email_sent IS 'Indica si se envió el email correctamente';
COMMENT ON COLUMN public.daily_incomplete_reports.email_id IS 'ID del email enviado por el servicio de email';
COMMENT ON COLUMN public.daily_incomplete_reports.email_subject IS 'Asunto del email enviado';
COMMENT ON COLUMN public.daily_incomplete_reports.report_status IS 'Estado del reporte: pending, success, error';
COMMENT ON COLUMN public.daily_incomplete_reports.error_message IS 'Mensaje de error si el reporte falló';
COMMENT ON COLUMN public.daily_incomplete_reports.execution_time_ms IS 'Tiempo de ejecución en milisegundos';