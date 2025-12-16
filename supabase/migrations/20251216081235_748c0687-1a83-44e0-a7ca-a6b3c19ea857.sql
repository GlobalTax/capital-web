-- Permitir NULL en columna 'action' para compatibilidad con check_rate_limit_enhanced()
ALTER TABLE public.rate_limits 
ALTER COLUMN action DROP NOT NULL;