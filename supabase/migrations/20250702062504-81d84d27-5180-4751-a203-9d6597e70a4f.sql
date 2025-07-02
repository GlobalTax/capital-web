-- Crear tabla system_logs para el sistema de logging
CREATE TABLE public.system_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    context TEXT,
    component TEXT,
    user_id UUID,
    session_id TEXT,
    log_data JSONB,
    error_stack TEXT,
    environment TEXT,
    user_agent TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Política para que solo admins puedan ver logs
CREATE POLICY "Admin can view system logs" 
ON public.system_logs 
FOR SELECT 
TO authenticated
USING (public.current_user_is_admin());

-- Política para que el sistema pueda insertar logs
CREATE POLICY "System can insert logs" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (true);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_system_logs_level ON public.system_logs (level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs (created_at DESC);
CREATE INDEX idx_system_logs_user_id ON public.system_logs (user_id);
CREATE INDEX idx_system_logs_context ON public.system_logs (context);