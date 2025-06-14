
-- Crear tabla para almacenar las valoraciones de la herramienta
CREATE TABLE public.tool_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Datos de la valoración
  ease_of_use INTEGER NOT NULL CHECK (ease_of_use >= 1 AND ease_of_use <= 5),
  result_accuracy INTEGER NOT NULL CHECK (result_accuracy >= 1 AND result_accuracy <= 5),
  recommendation INTEGER NOT NULL CHECK (recommendation >= 1 AND recommendation <= 5),
  
  -- Comentario opcional
  feedback_comment TEXT,
  
  -- Email opcional para seguimiento
  user_email TEXT,
  
  -- Contexto de la empresa que valoró
  company_sector TEXT,
  company_size TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Crear índices para consultas
CREATE INDEX idx_tool_ratings_created_at ON public.tool_ratings(created_at);
CREATE INDEX idx_tool_ratings_company_sector ON public.tool_ratings(company_sector);
CREATE INDEX idx_tool_ratings_company_size ON public.tool_ratings(company_size);

-- No necesitamos RLS ya que es una tabla pública para recopilar feedback
-- Los datos serán insertados sin autenticación
