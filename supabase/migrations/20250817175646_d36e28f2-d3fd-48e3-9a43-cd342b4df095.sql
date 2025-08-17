-- Crear tabla para logging de descargas de PDF (opcional pero útil para métricas)
CREATE TABLE IF NOT EXISTS public.pdf_download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  valuation_id UUID REFERENCES public.company_valuations(id),
  pdf_type TEXT NOT NULL CHECK (pdf_type IN ('react_pdf', 'edge_function', 'simple_report')),
  download_status TEXT NOT NULL DEFAULT 'success' CHECK (download_status IN ('success', 'error')),
  file_size_bytes INTEGER,
  generation_time_ms INTEGER,
  user_agent TEXT,
  ip_address INET DEFAULT inet_client_addr(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pdf_download_logs ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios logs
CREATE POLICY "Users can view their own PDF download logs"
ON public.pdf_download_logs FOR SELECT
USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar sus propios logs
CREATE POLICY "Users can insert their own PDF download logs"
ON public.pdf_download_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Crear índices para performance
CREATE INDEX idx_pdf_download_logs_user_id ON public.pdf_download_logs(user_id);
CREATE INDEX idx_pdf_download_logs_valuation_id ON public.pdf_download_logs(valuation_id);
CREATE INDEX idx_pdf_download_logs_created_at ON public.pdf_download_logs(created_at);